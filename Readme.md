## Dev Tunnel Setup Guide

### Installing Dev Tunnel

#### Windows
To install Dev Tunnel on Windows, use the following command:
```bash
winget install Microsoft.devtunnel
```

#### macOS
To install Dev Tunnel on macOS, use the following command:
```bash
brew install --cask devtunnel
```

### Creating a Persistent Dev Tunnel

1. **Login**  
    Authenticate using GitHub or Microsoft Entra ID:
    ```bash
    devtunnel user login
    ```

2. **Create a Persistent Tunnel**  
    Run the following command to create a persistent Dev Tunnel:
    ```bash
    devtunnel create
    ```

3. **Create a Port for Webhook Connection**  
    Use the command below to create a port for connecting to the webhook:
    ```bash
    devtunnel port create -p 8081
    ```

4. **Verify the Tunnel**  
    Check the details of the created Dev Tunnel:
    ```bash
    devtunnel show
    ```

    Example output:
    ```
    Tunnel ID             : <tunnel-name>
    Description           :
    Labels                :
    Access control        : {+Anonymous [connect]}
    Host connections      : 0
    Client connections    : 0
    Current upload rate   : 0 MB/s (limit: 20 MB/s)
    Current download rate : 0 MB/s (limit: 20 MB/s)
    Upload total          : 3441 KB
    Download total        : 2588 KB
    Ports                 : 1
      8081  auto  https://<tunnel-name>.devtunnels.ms/  0 client connections
    Tunnel Expiration     : 30 days
    ```

5. **Serve Traffic**  
    Start hosting traffic through the Dev Tunnel:
    ```bash
    devtunnel host
    ```
    Take note of the public URL of your tunnel, you will need this URL to configure webhook with Azure Event Grid