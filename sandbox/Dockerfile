FROM alpine:3.19

RUN apk add --no-libc-utils --no-cache \
    bash \
    coreutils \
    git \
    nodejs \
    npm \
    python3 \
    make \
    g++

# Create non-root user
RUN addgroup -g 1000 sandboxgroup && \
    adduser -u 1000 -G sandboxgroup -s /bin/bash -D sandboxuser

# Create workspace directory
WORKDIR /workspace
RUN chown -R sandboxuser:sandboxgroup /workspace

USER sandboxuser

CMD ["/bin/bash"]
