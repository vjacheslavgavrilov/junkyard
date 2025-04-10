1. I have created a repository for all my digital content
2. Also, I tried to improve my JavaScript skills.
3. This code was put in the .htaccess file:

        # Redirecting to HTTPS
        RewriteEngine On
        RewriteCond %{SERVER_PORT} !^443$
        RewriteRule .* https://%{SERVER_NAME}%{REQUEST_URI} [R,L]
        
        # Error Pages - redirect all to index.html
        ErrorDocument 400 /index.html
        ErrorDocument 401 /index.html
        ErrorDocument 403 /index.html
        ErrorDocument 404 /index.html
        ErrorDocument 500 /index.html
        
        # Adding HTML to a page
        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteRule ^([^\.]+)$ $1.html [NC,L]
