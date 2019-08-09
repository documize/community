package cas

import (
	"crypto/rand"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"path"
	"sync"

	"github.com/golang/glog"
)

// Client configuration options
type Options struct {
	URL         *url.URL     // URL to the CAS service
	Store       TicketStore  // Custom TicketStore, if nil a MemoryStore will be used
	Client      *http.Client // Custom http client to allow options for http connections
	SendService bool         // Custom sendService to determine whether you need to send service param
}

// Client implements the main protocol
type Client struct {
	url     *url.URL
	tickets TicketStore
	client  *http.Client

	mu          sync.Mutex
	sessions    map[string]string
	sendService bool
}

// NewClient creates a Client with the provided Options.
func NewClient(options *Options) *Client {
	if glog.V(2) {
		glog.Infof("cas: new client with options %v", options)
	}

	var tickets TicketStore
	if options.Store != nil {
		tickets = options.Store
	} else {
		tickets = &MemoryStore{}
	}

	var client *http.Client
	if options.Client != nil {
		client = options.Client
	} else {
		client = &http.Client{}
	}

	return &Client{
		url:         options.URL,
		tickets:     tickets,
		client:      client,
		sessions:    make(map[string]string),
		sendService: options.SendService,
	}
}

// Handle wraps a http.Handler to provide CAS authentication for the handler.
func (c *Client) Handle(h http.Handler) http.Handler {
	return &clientHandler{
		c: c,
		h: h,
	}
}

// HandleFunc wraps a function to provide CAS authentication for the handler function.
func (c *Client) HandleFunc(h func(http.ResponseWriter, *http.Request)) http.Handler {
	return c.Handle(http.HandlerFunc(h))
}

// requestURL determines an absolute URL from the http.Request.
func requestURL(r *http.Request) (*url.URL, error) {
	u, err := url.Parse(r.URL.String())
	if err != nil {
		return nil, err
	}

	u.Host = r.Host
	u.Scheme = "http"

	if scheme := r.Header.Get("X-Forwarded-Proto"); scheme != "" {
		u.Scheme = scheme
	} else if r.TLS != nil {
		u.Scheme = "https"
	}

	return u, nil
}

// LoginUrlForRequest determines the CAS login URL for the http.Request.
func (c *Client) LoginUrlForRequest(r *http.Request) (string, error) {
	u, err := c.url.Parse(path.Join(c.url.Path, "login"))
	if err != nil {
		return "", err
	}

	service, err := requestURL(r)
	if err != nil {
		return "", err
	}

	q := u.Query()
	q.Add("service", sanitisedURLString(service))
	u.RawQuery = q.Encode()

	return u.String(), nil
}

// LogoutUrlForRequest determines the CAS logout URL for the http.Request.
func (c *Client) LogoutUrlForRequest(r *http.Request) (string, error) {
	u, err := c.url.Parse(path.Join(c.url.Path, "logout"))
	if err != nil {
		return "", err
	}

	if c.sendService {
		service, err := requestURL(r)
		if err != nil {
			return "", err
		}

		q := u.Query()
		q.Add("service", sanitisedURLString(service))
		u.RawQuery = q.Encode()
	}

	return u.String(), nil
}

// ServiceValidateUrlForRequest determines the CAS serviceValidate URL for the ticket and http.Request.
func (c *Client) ServiceValidateUrlForRequest(ticket string, r *http.Request) (string, error) {
	u, err := c.url.Parse(path.Join(c.url.Path, "serviceValidate"))
	if err != nil {
		return "", err
	}

	service, err := requestURL(r)
	if err != nil {
		return "", err
	}

	q := u.Query()
	q.Add("service", sanitisedURLString(service))
	q.Add("ticket", ticket)
	u.RawQuery = q.Encode()

	return u.String(), nil
}

// ValidateUrlForRequest determines the CAS validate URL for the ticket and http.Request.
func (c *Client) ValidateUrlForRequest(ticket string, r *http.Request) (string, error) {
	u, err := c.url.Parse(path.Join(c.url.Path, "validate"))
	if err != nil {
		return "", err
	}

	service, err := requestURL(r)
	if err != nil {
		return "", err
	}

	q := u.Query()
	q.Add("service", sanitisedURLString(service))
	q.Add("ticket", ticket)
	u.RawQuery = q.Encode()

	return u.String(), nil
}

// RedirectToLogout replies to the request with a redirect URL to log out of CAS.
func (c *Client) RedirectToLogout(w http.ResponseWriter, r *http.Request) {
	u, err := c.LogoutUrlForRequest(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if glog.V(2) {
		glog.Info("Logging out, redirecting client to %v with status %v",
			u, http.StatusFound)
	}

	c.clearSession(w, r)
	http.Redirect(w, r, u, http.StatusFound)
}

// RedirectToLogout replies to the request with a redirect URL to authenticate with CAS.
func (c *Client) RedirectToLogin(w http.ResponseWriter, r *http.Request) {
	u, err := c.LoginUrlForRequest(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if glog.V(2) {
		glog.Infof("Redirecting client to %v with status %v", u, http.StatusFound)
	}

	http.Redirect(w, r, u, http.StatusFound)
}

// validateTicket performs CAS ticket validation with the given ticket and service.
//
// If the request returns a 404 then validateTicketCas1 will be returned.
func (c *Client) validateTicket(ticket string, service *http.Request) error {
	if glog.V(2) {
		serviceUrl, _ := requestURL(service)
		glog.Infof("Validating ticket %v for service %v", ticket, serviceUrl)
	}

	u, err := c.ServiceValidateUrlForRequest(ticket, service)
	if err != nil {
		return err
	}

	r, err := http.NewRequest("GET", u, nil)
	if err != nil {
		return err
	}

	r.Header.Add("User-Agent", "Golang CAS client gopkg.in/cas")

	if glog.V(2) {
		glog.Infof("Attempting ticket validation with %v", r.URL)
	}

	resp, err := c.client.Do(r)
	if err != nil {
		return err
	}

	if glog.V(2) {
		glog.Infof("Request %v %v returned %v",
			r.Method, r.URL,
			resp.Status)
	}

	if resp.StatusCode == http.StatusNotFound {
		return c.validateTicketCas1(ticket, service)
	}

	body, err := ioutil.ReadAll(resp.Body)
	resp.Body.Close()

	if err != nil {
		return err
	}

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("cas: validate ticket: %v", string(body))
	}

	if glog.V(2) {
		glog.Infof("Received authentication response\n%v", string(body))
	}

	success, err := ParseServiceResponse(body)
	if err != nil {
		return err
	}

	if glog.V(2) {
		glog.Infof("Parsed ServiceResponse: %#v", success)
	}

	if err := c.tickets.Write(ticket, success); err != nil {
		return err
	}

	return nil
}

// validateTicketCas1 performs CAS protocol 1 ticket validation.
func (c *Client) validateTicketCas1(ticket string, service *http.Request) error {
	u, err := c.ValidateUrlForRequest(ticket, service)
	if err != nil {
		return err
	}

	r, err := http.NewRequest("GET", u, nil)
	if err != nil {
		return err
	}

	r.Header.Add("User-Agent", "Golang CAS client gopkg.in/cas")

	if glog.V(2) {
		glog.Info("Attempting ticket validation with %v", r.URL)
	}

	resp, err := c.client.Do(r)
	if err != nil {
		return err
	}

	if glog.V(2) {
		glog.Info("Request %v %v returned %v",
			r.Method, r.URL,
			resp.Status)
	}

	data, err := ioutil.ReadAll(resp.Body)
	resp.Body.Close()

	if err != nil {
		return err
	}

	body := string(data)

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("cas: validate ticket: %v", body)
	}

	if glog.V(2) {
		glog.Infof("Received authentication response\n%v", body)
	}

	if body == "no\n\n" {
		return nil // not logged in
	}

	success := &AuthenticationResponse{
		User: body[4 : len(body)-1],
	}

	if glog.V(2) {
		glog.Infof("Parsed ServiceResponse: %#v", success)
	}

	if err := c.tickets.Write(ticket, success); err != nil {
		return err
	}

	return nil
}

// getSession finds or creates a session for the request.
//
// A cookie is set on the response if one is not provided with the request.
// Validates the ticket if the URL parameter is provided.
func (c *Client) getSession(w http.ResponseWriter, r *http.Request) {
	cookie := getCookie(w, r)

	if s, ok := c.sessions[cookie.Value]; ok {
		if t, err := c.tickets.Read(s); err == nil {
			if glog.V(1) {
				glog.Infof("Re-used ticket %s for %s", s, t.User)
			}

			setAuthenticationResponse(r, t)
			return
		} else {
			if glog.V(2) {
				glog.Infof("Ticket %v not in %T: %v", s, c.tickets, err)
			}

			if glog.V(1) {
				glog.Infof("Clearing ticket %s, no longer exists in ticket store", s)
			}

			clearCookie(w, cookie)
		}
	}

	if ticket := r.URL.Query().Get("ticket"); ticket != "" {
		if err := c.validateTicket(ticket, r); err != nil {
			if glog.V(2) {
				glog.Infof("Error validating ticket: %v", err)
			}
			return // allow ServeHTTP()
		}

		c.setSession(cookie.Value, ticket)

		if t, err := c.tickets.Read(ticket); err == nil {
			if glog.V(1) {
				glog.Infof("Validated ticket %s for %s", ticket, t.User)
			}

			setAuthenticationResponse(r, t)
			return
		} else {
			if glog.V(2) {
				glog.Infof("Ticket %v not in %T: %v", ticket, c.tickets, err)
			}

			if glog.V(1) {
				glog.Infof("Clearing ticket %s, no longer exists in ticket store", ticket)
			}

			clearCookie(w, cookie)
		}
	}
}

// getCookie finds or creates the session cookie on the response.
func getCookie(w http.ResponseWriter, r *http.Request) *http.Cookie {
	c, err := r.Cookie(sessionCookieName)
	if err != nil {
		// NOTE: Intentionally not enabling HttpOnly so the cookie can
		//       still be used by Ajax requests.
		c = &http.Cookie{
			Name:     sessionCookieName,
			Value:    newSessionId(),
			MaxAge:   86400,
			HttpOnly: false,
		}

		if glog.V(2) {
			glog.Infof("Setting %v cookie with value: %v", c.Name, c.Value)
		}

		r.AddCookie(c) // so we can find it later if required
		http.SetCookie(w, c)
	}

	return c
}

// newSessionId generates a new opaque session identifier for use in the cookie.
func newSessionId() string {
	const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

	// generate 64 character string
	bytes := make([]byte, 64)
	rand.Read(bytes)

	for k, v := range bytes {
		bytes[k] = alphabet[v%byte(len(alphabet))]
	}

	return string(bytes)
}

// clearCookie invalidates and removes the cookie from the client.
func clearCookie(w http.ResponseWriter, c *http.Cookie) {
	c.MaxAge = -1
	http.SetCookie(w, c)
}

// setSession stores the session id to ticket mapping in the Client.
func (c *Client) setSession(id string, ticket string) {
	if glog.V(2) {
		glog.Infof("Recording session, %v -> %v", id, ticket)
	}

	c.mu.Lock()
	c.sessions[id] = ticket
	c.mu.Unlock()
}

// clearSession removes the session from the client and clears the cookie.
func (c *Client) clearSession(w http.ResponseWriter, r *http.Request) {
	cookie := getCookie(w, r)

	if s, ok := c.sessions[cookie.Value]; ok {
		if err := c.tickets.Delete(s); err != nil {
			fmt.Printf("Failed to remove %v from %T: %v\n", cookie.Value, c.tickets, err)
			if glog.V(2) {
				glog.Errorf("Failed to remove %v from %T: %v", cookie.Value, c.tickets, err)
			}
		}

		c.deleteSession(s)
	}

	clearCookie(w, cookie)
}

// deleteSession removes the session from the client
func (c *Client) deleteSession(id string) {
	c.mu.Lock()
	delete(c.sessions, id)
	c.mu.Unlock()
}

// findAndDeleteSessionWithTicket removes the session from the client via Single Log Out
//
// When a Single Log Out request is received we receive the service ticket identidier. This
// function loops through the sessions to find the matching session id. Once retrieved the
// session is removed from the client. When the session is next requested the getSession
// function will notice the session is invalid and revalidate the user.
func (c *Client) findAndDeleteSessionWithTicket(ticket string) {
	var id string
	for s, t := range c.sessions {
		if t == ticket {
			id = s
			break
		}
	}

	if id == "" {
		return
	}

	c.deleteSession(id)
}
