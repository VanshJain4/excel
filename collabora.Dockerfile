FROM collabora/code:latest

# Expose port
EXPOSE 9980

# Set environment variables
ENV domain=localhost
ENV username=admin
ENV password=collabora_password
ENV dictionaries=en_US
ENV extra_params=--o:ssl.enable=false --o:ssl.termination=true --o:net.frame_ancestors=* --o:net.post_allow.host=* --o:wopi.host.allowlist=*

# Start Collabora
CMD ["/usr/bin/coolwsd"] 