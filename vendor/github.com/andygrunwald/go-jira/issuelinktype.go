package jira

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
)

// IssueLinkTypeService handles issue link types for the JIRA instance / API.
//
// JIRA API docs: https://developer.atlassian.com/cloud/jira/platform/rest/v2/#api-group-Issue-link-types
type IssueLinkTypeService struct {
	client *Client
}

// GetList gets all of the issue link types from JIRA.
//
// JIRA API docs: https://developer.atlassian.com/cloud/jira/platform/rest/v2/#api-rest-api-2-issueLinkType-get
func (s *IssueLinkTypeService) GetList() ([]IssueLinkType, *Response, error) {
	apiEndpoint := "rest/api/2/issueLinkType"
	req, err := s.client.NewRequest("GET", apiEndpoint, nil)
	if err != nil {
		return nil, nil, err
	}

	linkTypeList := []IssueLinkType{}
	resp, err := s.client.Do(req, &linkTypeList)
	if err != nil {
		return nil, resp, NewJiraError(resp, err)
	}
	return linkTypeList, resp, nil
}

// Get gets info of a specific issue link type from JIRA.
//
// JIRA API docs: https://developer.atlassian.com/cloud/jira/platform/rest/v2/#api-rest-api-2-issueLinkType-issueLinkTypeId-get
func (s *IssueLinkTypeService) Get(ID string) (*IssueLinkType, *Response, error) {
	apiEndPoint := fmt.Sprintf("rest/api/2/issueLinkType/%s", ID)
	req, err := s.client.NewRequest("GET", apiEndPoint, nil)
	if err != nil {
		return nil, nil, err
	}

	linkType := new(IssueLinkType)
	resp, err := s.client.Do(req, linkType)
	if err != nil {
		return nil, resp, NewJiraError(resp, err)
	}
	return linkType, resp, nil
}

// Create creates an issue link type in JIRA.
//
// JIRA API docs: https://developer.atlassian.com/cloud/jira/platform/rest/v2/#api-rest-api-2-issueLinkType-post
func (s *IssueLinkTypeService) Create(linkType *IssueLinkType) (*IssueLinkType, *Response, error) {
	apiEndpoint := "/rest/api/2/issueLinkType"
	req, err := s.client.NewRequest("POST", apiEndpoint, linkType)
	if err != nil {
		return nil, nil, err
	}

	resp, err := s.client.Do(req, nil)
	if err != nil {
		return nil, resp, err
	}

	responseLinkType := new(IssueLinkType)
	defer resp.Body.Close()
	data, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		e := fmt.Errorf("Could not read the returned data")
		return nil, resp, NewJiraError(resp, e)
	}
	err = json.Unmarshal(data, responseLinkType)
	if err != nil {
		e := fmt.Errorf("Could no unmarshal the data into struct")
		return nil, resp, NewJiraError(resp, e)
	}
	return linkType, resp, nil
}

// Update updates an issue link type.  The issue is found by key.
//
// JIRA API docs: https://developer.atlassian.com/cloud/jira/platform/rest/v2/#api-rest-api-2-issueLinkType-issueLinkTypeId-put
func (s *IssueLinkTypeService) Update(linkType *IssueLinkType) (*IssueLinkType, *Response, error) {
	apiEndpoint := fmt.Sprintf("rest/api/2/issueLinkType/%s", linkType.ID)
	req, err := s.client.NewRequest("PUT", apiEndpoint, linkType)
	if err != nil {
		return nil, nil, err
	}
	resp, err := s.client.Do(req, nil)
	if err != nil {
		return nil, resp, NewJiraError(resp, err)
	}
	ret := *linkType
	return &ret, resp, nil
}

// Delete deletes an issue link type based on provided ID.
//
// JIRA API docs: https://developer.atlassian.com/cloud/jira/platform/rest/v2/#api-rest-api-2-issueLinkType-issueLinkTypeId-delete
func (s *IssueLinkTypeService) Delete(ID string) (*Response, error) {
	apiEndpoint := fmt.Sprintf("rest/api/2/issueLinkType/%s", ID)
	req, err := s.client.NewRequest("DELETE", apiEndpoint, nil)
	if err != nil {
		return nil, err
	}

	resp, err := s.client.Do(req, nil)
	return resp, err
}
