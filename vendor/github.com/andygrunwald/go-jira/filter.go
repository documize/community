package jira

import "github.com/google/go-querystring/query"
import "fmt"

// FilterService handles fields for the JIRA instance / API.
//
// JIRA API docs: https://developer.atlassian.com/cloud/jira/platform/rest/v3/#api-group-Filter
type FilterService struct {
	client *Client
}

// Filter represents a Filter in Jira
type Filter struct {
	Self             string        `json:"self"`
	ID               string        `json:"id"`
	Name             string        `json:"name"`
	Description      string        `json:"description"`
	Owner            User          `json:"owner"`
	Jql              string        `json:"jql"`
	ViewURL          string        `json:"viewUrl"`
	SearchURL        string        `json:"searchUrl"`
	Favourite        bool          `json:"favourite"`
	FavouritedCount  int           `json:"favouritedCount"`
	SharePermissions []interface{} `json:"sharePermissions"`
	Subscriptions    struct {
		Size       int           `json:"size"`
		Items      []interface{} `json:"items"`
		MaxResults int           `json:"max-results"`
		StartIndex int           `json:"start-index"`
		EndIndex   int           `json:"end-index"`
	} `json:"subscriptions"`
}

// GetMyFiltersQueryOptions specifies the optional parameters for the Get My Filters method
type GetMyFiltersQueryOptions struct {
	IncludeFavourites bool   `url:"includeFavourites,omitempty"`
	Expand            string `url:"expand,omitempty"`
}

// FiltersList reflects a list of filters
type FiltersList struct {
	MaxResults int               `json:"maxResults" structs:"maxResults"`
	StartAt    int               `json:"startAt" structs:"startAt"`
	Total      int               `json:"total" structs:"total"`
	IsLast     bool              `json:"isLast" structs:"isLast"`
	Values     []FiltersListItem `json:"values" structs:"values"`
}

// FiltersListItem represents a Filter of FiltersList in Jira
type FiltersListItem struct {
	Self             string        `json:"self"`
	ID               string        `json:"id"`
	Name             string        `json:"name"`
	Description      string        `json:"description"`
	Owner            User          `json:"owner"`
	Jql              string        `json:"jql"`
	ViewURL          string        `json:"viewUrl"`
	SearchURL        string        `json:"searchUrl"`
	Favourite        bool          `json:"favourite"`
	FavouritedCount  int           `json:"favouritedCount"`
	SharePermissions []interface{} `json:"sharePermissions"`
	Subscriptions    []struct {
		ID   int  `json:"id"`
		User User `json:"user"`
	} `json:"subscriptions"`
}

// FilterSearchOptions specifies the optional parameters for the Search method
// https://developer.atlassian.com/cloud/jira/platform/rest/v3/#api-rest-api-3-filter-search-get
type FilterSearchOptions struct {
	// String used to perform a case-insensitive partial match with name.
	FilterName string `url:"filterName,omitempty"`

	// User account ID used to return filters with the matching owner.accountId. This parameter cannot be used with owner.
	AccountID string `url:"accountId,omitempty"`

	// Group name used to returns filters that are shared with a group that matches sharePermissions.group.groupname.
	GroupName string `url:"groupname,omitempty"`

	// Project ID used to returns filters that are shared with a project that matches sharePermissions.project.id.
	// Format: int64
	ProjectID int64 `url:"projectId,omitempty"`

	// Orders the results using one of these filter properties.
	//   - `description` Orders by filter `description`. Note that this ordering works independently of whether the expand to display the description field is in use.
	//   - `favourite_count` Orders by `favouritedCount`.
	//   - `is_favourite` Orders by `favourite`.
	//   - `id` Orders by filter `id`.
	//   - `name` Orders by filter `name`.
	//   - `owner` Orders by `owner.accountId`.
	//
	// Default: `name`
	//
	// Valid values: id, name, description, owner, favorite_count, is_favorite, -id, -name, -description, -owner, -favorite_count, -is_favorite
	OrderBy string `url:"orderBy,omitempty"`

	// The index of the first item to return in a page of results (page offset).
	// Default: 0, Format: int64
	StartAt int64 `url:"startAt,omitempty"`

	// The maximum number of items to return per page. The maximum is 100.
	// Default: 50, Format: int32
	MaxResults int32 `url:"maxResults,omitempty"`

	// Use expand to include additional information about filter in the response. This parameter accepts multiple values separated by a comma:
	// - description Returns the description of the filter.
	// - favourite Returns an indicator of whether the user has set the filter as a favorite.
	// - favouritedCount Returns a count of how many users have set this filter as a favorite.
	// - jql Returns the JQL query that the filter uses.
	// - owner Returns the owner of the filter.
	// - searchUrl Returns a URL to perform the filter's JQL query.
	// - sharePermissions Returns the share permissions defined for the filter.
	// - subscriptions Returns the users that are subscribed to the filter.
	// - viewUrl Returns a URL to view the filter.
	Expand string `url:"expand,omitempty"`
}

// GetList retrieves all filters from Jira
func (fs *FilterService) GetList() ([]*Filter, *Response, error) {

	options := &GetQueryOptions{}
	apiEndpoint := "rest/api/2/filter"
	req, err := fs.client.NewRequest("GET", apiEndpoint, nil)
	if err != nil {
		return nil, nil, err
	}

	if options != nil {
		q, err := query.Values(options)
		if err != nil {
			return nil, nil, err
		}
		req.URL.RawQuery = q.Encode()
	}

	filters := []*Filter{}
	resp, err := fs.client.Do(req, &filters)
	if err != nil {
		jerr := NewJiraError(resp, err)
		return nil, resp, jerr
	}
	return filters, resp, err
}

// GetFavouriteList retrieves the user's favourited filters from Jira
func (fs *FilterService) GetFavouriteList() ([]*Filter, *Response, error) {
	apiEndpoint := "rest/api/2/filter/favourite"
	req, err := fs.client.NewRequest("GET", apiEndpoint, nil)
	if err != nil {
		return nil, nil, err
	}
	filters := []*Filter{}
	resp, err := fs.client.Do(req, &filters)
	if err != nil {
		jerr := NewJiraError(resp, err)
		return nil, resp, jerr
	}
	return filters, resp, err
}

// Get retrieves a single Filter from Jira
func (fs *FilterService) Get(filterID int) (*Filter, *Response, error) {
	apiEndpoint := fmt.Sprintf("rest/api/2/filter/%d", filterID)
	req, err := fs.client.NewRequest("GET", apiEndpoint, nil)
	if err != nil {
		return nil, nil, err
	}
	filter := new(Filter)
	resp, err := fs.client.Do(req, filter)
	if err != nil {
		jerr := NewJiraError(resp, err)
		return nil, resp, jerr
	}

	return filter, resp, err
}

// GetMyFilters retrieves the my Filters.
//
// https://developer.atlassian.com/cloud/jira/platform/rest/v3/#api-rest-api-3-filter-my-get
func (fs *FilterService) GetMyFilters(opts *GetMyFiltersQueryOptions) ([]*Filter, *Response, error) {
	apiEndpoint := "rest/api/3/filter/my"
	url, err := addOptions(apiEndpoint, opts)
	if err != nil {
		return nil, nil, err
	}
	req, err := fs.client.NewRequest("GET", url, nil)
	if err != nil {
		return nil, nil, err
	}

	filters := []*Filter{}
	resp, err := fs.client.Do(req, &filters)
	if err != nil {
		jerr := NewJiraError(resp, err)
		return nil, resp, jerr
	}
	return filters, resp, nil
}

// Search will search for filter according to the search options
//
// JIRA API docs: https://developer.atlassian.com/cloud/jira/platform/rest/v3/#api-rest-api-3-filter-search-get
func (fs *FilterService) Search(opt *FilterSearchOptions) (*FiltersList, *Response, error) {
	apiEndpoint := "rest/api/3/filter/search"
	url, err := addOptions(apiEndpoint, opt)
	if err != nil {
		return nil, nil, err
	}
	req, err := fs.client.NewRequest("GET", url, nil)
	if err != nil {
		return nil, nil, err
	}

	filters := new(FiltersList)
	resp, err := fs.client.Do(req, filters)
	if err != nil {
		jerr := NewJiraError(resp, err)
		return nil, resp, jerr
	}

	return filters, resp, err
}
