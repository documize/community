FROM golang:1.12-alpine as builder
COPY . /go/src/github.com/documize/community
RUN cd /go/src/github.com/documize/community
RUN env GOOS=linux GOARCH=amd64 GODEBUG=tls13=1 go build -mod=vendor -o bin/documize-community-linux-amd64 ./edition/community.go

# build release image
FROM alpine:3.10
RUN apk update && apk add ca-certificates && rm -rf /var/cache/apk/*
COPY --from=builder /go/src/github.com/documize/community/bin/documize-community-linux-amd64 /documize
EXPOSE 5001
ENTRYPOINT [ "/documize" ]
