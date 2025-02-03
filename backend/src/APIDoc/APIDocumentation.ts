import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Palette API",
      version: "1.0.0",
      description: "OpenAPI documentation for Palette API",
      contact: {
        name: "Support Team",
        email: "contactsupport@asu.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000/api",
        description: "Development Server",
      },
    ],
  },
  apis: ["src/routes/*.ts"], // Path to the API routes
};

export const swaggerSpec = swaggerJsDoc(swaggerOptions);
export const swaggerUiServe = swaggerUi.serve;
export const swaggerUiSetup = swaggerUi.setup(swaggerSpec);
