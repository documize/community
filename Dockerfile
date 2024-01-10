FROM node:16-alpine as frontbuilder
WORKDIR /go/src/github.com/documize/community/gui
COPY ./gui /go/src/github.com/documize/community/gui
RUN npm --network-timeout=100000 install
RUN npm run build -- --environment=production --output-path dist-prod --suppress-sizes true

FROM golang:1.21-alpine as builder
WORKDIR /go/src/github.com/documize/community
COPY . /go/src/github.com/documize/community
COPY --from=frontbuilder /go/src/github.com/documize/community/gui/dist-prod/assets /go/src/github.com/documize/community/edition/static/public/assets
COPY --from=frontbuilder /go/src/github.com/documize/community/gui/dist-prod/codemirror /go/src/github.com/documize/community/edition/static/public/codemirror
COPY --from=frontbuilder /go/src/github.com/documize/community/gui/dist-prod/prism /go/src/github.com/documize/community/edition/static/public/prism
COPY --from=frontbuilder /go/src/github.com/documize/community/gui/dist-prod/sections /go/src/github.com/documize/community/edition/static/public/sections
COPY --from=frontbuilder /go/src/github.com/documize/community/gui/dist-prod/tinymce /go/src/github.com/documize/community/edition/static/public/tinymce
COPY --from=frontbuilder /go/src/github.com/documize/community/gui/dist-prod/pdfjs /go/src/github.com/documize/community/edition/static/public/pdfjs
COPY --from=frontbuilder /go/src/github.com/documize/community/gui/dist-prod/i18n /go/src/github.com/documize/community/edition/static/public/i18n
COPY --from=frontbuilder /go/src/github.com/documize/community/gui/dist-prod/*.* /go/src/github.com/documize/community/edition/static/
COPY --from=frontbuilder /go/src/github.com/documize/community/gui/dist-prod/i18n/*.json /go/src/github.com/documize/community/edition/static/i18n/
COPY domain/mail/*.html /go/src/github.com/documize/community/edition/static/mail/
COPY core/database/templates/*.html /go/src/github.com/documize/community/edition/static/
COPY core/database/scripts/mysql/*.sql /go/src/github.com/documize/community/edition/static/scripts/mysql/
COPY core/database/scripts/postgresql/*.sql /go/src/github.com/documize/community/edition/static/scripts/postgresql/
COPY core/database/scripts/sqlserver/*.sql /go/src/github.com/documize/community/edition/static/scripts/sqlserver/
COPY domain/onboard/*.json /go/src/github.com/documize/community/edition/static/onboard/
RUN env GODEBUG=tls13=1 go build -mod=vendor -o bin/documize-community ./edition/community.go

# build release image
FROM alpine:3.16
RUN apk add --no-cache ca-certificates
COPY --from=builder /go/src/github.com/documize/community/bin/documize-community /documize
EXPOSE 5001
ENTRYPOINT [ "/documize" ]
