# Virtual DOM Frontend Demo

This is a frontend demo application designed to simulate the inner workings of a virtual DOM library, showcasing virtual DOM node creation, rendering, and efficient DOM updating. Users can interact with the application by entering their age and country to get an estimate of years remaining.

## Features

### Core Functionality

- **Virtual DOM Node Construction**: Functions that construct virtual DOM nodes (vnodes), representing the UI structure independently of the actual DOM.
- **VNode-to-DOM Translation**: Renders vnodes into real DOM elements, maintaining a clear separation between the UI representation and its rendered output.
- **Reconciliation and Diffing Algorithm**: Compares the old and new virtual DOM trees to update only the modified parts of the DOM, enhancing performance by minimizing DOM manipulations.
- **State Management with `useState`**: Provides a basic `useState` hook for managing component-level state within the virtual DOM structure.

### Demo Application

- **Mock API Call**: Simulates an API call using user inputs (age and country) to estimate years remaining based on the data provided.

## Tech Stack

- **Vite**: A fast, modern front-end tool and development server.
- **TypeScript**: A strongly-typed language that enables safer, more maintainable code.
- **Jest**: A JavaScript testing framework used for unit and integration testing.

## CI/CD Pipeline

This project includes a GitHub Actions CI/CD pipeline with the following stages:

1. **TypeScript Type Checking**: Ensures type safety across the codebase.
2. **Unit & Integration Testing**: Runs Jest tests to verify functionality and prevent regressions.
3. **Docker Image Build**: Creates a Docker image for the application.
4. **Amazon ECR Push**: Pushes the Docker image to Amazon Elastic Container Registry (ECR) for storage and versioning.
5. **Amazon Lightsail Deployment**: Deploys the Docker image from ECR to Amazon Lightsail, making it accessible in a hosted environment.

**Live**: https://react-clone.kq9dthbxrnxyt.eu-west-2.cs.amazonlightsail.com/
