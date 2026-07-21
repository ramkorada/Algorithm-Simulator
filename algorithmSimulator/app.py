"""
Algorithm Simulator — Application Entry Point.

Initializes the Flask application, configures structured logging,
and registers route blueprints.

This file intentionally contains no business logic, no algorithm code,
and no direct route definitions (except the root index route).
"""

import logging

from flask import Flask, render_template

from routes.api import api_blueprint


def configure_logging() -> None:
    """
    Configure structured logging for the application.

    Format: timestamp [LEVEL] module: message
    All loggers in the application inherit this configuration.
    """
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )


def create_app() -> Flask:
    """
    Application factory.

    Creates and returns a configured Flask application instance.
    Using the factory pattern makes the app easier to test
    and supports multiple configurations if needed in the future.

    Returns:
        Configured Flask application.
    """
    configure_logging()
    logger = logging.getLogger(__name__)

    app = Flask(
        __name__,
        template_folder="templates",
        static_folder="static",
    )

    # Register blueprints
    app.register_blueprint(api_blueprint)
    logger.info("Registered blueprint: api  (prefix: /api/v1)")

    @app.route("/")
    def index():
        """Serve the main single-page application."""
        return render_template("index.html")

    logger.info("Algorithm Simulator is ready.")
    return app


if __name__ == "__main__":
    flask_app = create_app()
    flask_app.run(debug=True, port=5000)
