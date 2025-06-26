# Use the official SQL Server image
FROM mcr.microsoft.com/mssql/server:2022-latest

# Set environment variables
ENV SA_PASSWORD="YourStrong!Passw0rd"
ENV ACCEPT_EULA=Y

# Expose SQL Server port
EXPOSE 1433

# Start SQL Server
CMD ["sqlservr"]