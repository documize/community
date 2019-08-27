package auth

// CASAuthRequest data received via CAS client library
type CASAuthRequest struct {
	Ticket string `json:"ticket"`
	Domain string `json:"domain"`
}

// CASConfig server configuration
type CASConfig struct {
	URL         string `json:"url"`
	RedirectURL string `json"redirectUrl"`
}
