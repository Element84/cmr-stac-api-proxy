# Deployment

## Architecture Overview

NASA's Common Metadata Repository is missing the capability to return STAC responses and does not have an interface for STAC API requests. This proxy service is a supliment to allow CMR to support STAC.

The application is a single cloud function that 