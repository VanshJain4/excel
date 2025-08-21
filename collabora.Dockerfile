FROM collabora/code:latest

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Expose port
EXPOSE 9980

# Set environment variables
ENV domain=localhost
ENV username=admin
ENV password=collabora_password
ENV dictionaries=en_US
ENV extra_params=--o:ssl.enable=false --o:ssl.termination=true --o:net.frame_ancestors=* --o:net.post_allow.host=* --o:wopi.host.allowlist=*

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:9980/hosting/capabilities || exit 1

# Start Collabora
CMD ["/usr/bin/coolwsd", "--version"] 