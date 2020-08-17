// Copyright 2016 Documize Inc. <legal@documize.com>. All rights reserved.
//
// This software (Documize Community Edition) is licensed under
// GNU AGPL v3 http://www.gnu.org/licenses/agpl-3.0.en.html
//
// You can operate outside the AGPL restrictions by purchasing
// Documize Enterprise Edition and obtaining a commercial license
// by contacting <sales@documize.com>.
//
// https://documize.com

package plantuml

import (
	"bytes"
	"crypto/tls"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/documize/community/core/env"
	"github.com/documize/community/domain/section/provider"
	"github.com/documize/community/domain/store"
)

// Provider represents PlantUML Text Diagram
type Provider struct {
	Runtime *env.Runtime
	Store   *store.Store
}

// Meta describes us
func (*Provider) Meta() provider.TypeMeta {
	section := provider.TypeMeta{}

	section.ID = "f1067a60-45e5-40b5-89f6-aa3b03dd7f35"
	section.Title = "PlantUML Diagram"
	section.Description = "Diagrams generated from text"
	section.ContentType = "plantuml"
	section.PageType = "tab"
	section.Order = 9990

	return section
}

// Command stub.
func (p *Provider) Command(ctx *provider.Context, w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	method := query.Get("method")

	if len(method) == 0 {
		provider.WriteMessage(w, "plantuml", "missing method name")
		return
	}

	switch method {
	case "preview":
		var payload struct {
			Data string `json:"data"`
		}

		defer r.Body.Close()
		body, err := ioutil.ReadAll(r.Body)
		if err != nil {
			provider.WriteMessage(w, "plantuml", "Bad payload")
			return
		}

		err = json.Unmarshal(body, &payload)
		if err != nil {
			provider.WriteMessage(w, "plantuml", "Cannot unmarshal")
			return
		}

		// Generate diagram if we have data.
		var diagram string
		if len(payload.Data) > 0 {
			diagram = p.generateDiagram(ctx, payload.Data)
		}
		payload.Data = diagram

		provider.WriteJSON(w, payload)
		return
	}

	provider.WriteEmpty(w)
}

// Render returns data as-is (HTML).
func (p *Provider) Render(ctx *provider.Context, config, data string) string {
	return p.generateDiagram(ctx, data)
}

// Refresh just sends back data as-is.
func (*Provider) Refresh(ctx *provider.Context, config, data string) string {
	return data
}

func (p *Provider) generateDiagram(ctx *provider.Context, data string) string {
	org, _ := p.Store.Organization.GetOrganization(ctx.Request, ctx.OrgID)

	var transport = &http.Transport{
		Proxy: http.ProxyFromEnvironment,
		TLSClientConfig: &tls.Config{
			InsecureSkipVerify: true, // TODO should be glick.InsecureSkipVerifyTLS (from -insecure flag) but get error: x509: certificate signed by unknown authority
		}}
	client := &http.Client{Transport: transport}

	resp, _ := client.Post(org.ConversionEndpoint+"/api/plantuml", "application/text; charset=utf-8", bytes.NewReader([]byte(data)))
	defer func() {
		if e := resp.Body.Close(); e != nil {
			fmt.Println("resp.Body.Close error: " + e.Error())
		}
	}()

	img, _ := ioutil.ReadAll(resp.Body)
	enc := base64.StdEncoding.EncodeToString(img)

	// return string(fmt.Sprintf("data:image/png;base64,%s", enc))

	return string(fmt.Sprintf("data:image/svg+xml;base64,%s", enc))
}
