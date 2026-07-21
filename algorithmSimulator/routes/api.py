"""
API Routes — Coin Change Blueprint.

Responsibility:
  - Expose HTTP endpoints.
  - Parse incoming JSON and delegate to the analysis service.
  - Return JSON responses.
"""

import logging
from flask import Blueprint, request, jsonify

from services.coin_change_service import run_analysis
from utils.constants import ERROR_INVALID_JSON, ERROR_UNEXPECTED

logger = logging.getLogger(__name__)

api_blueprint = Blueprint("api", __name__, url_prefix="/api/v1")


@api_blueprint.route("/coin-change", methods=["POST"])
def coin_change():
    """
    POST /api/v1/coin-change

    Delegates processing to the analysis service.
    """
    data = request.get_json(silent=True)

    if data is None:
        logger.warning("Request received with missing or malformed JSON body.")
        return jsonify({
            "error": "Invalid request.",
            "message": ERROR_INVALID_JSON,
        }), 400

    try:
        response_data, status_code = run_analysis(data)
        return jsonify(response_data), status_code
    except Exception as exc:
        logger.exception("Unexpected error during analysis: %s", exc)
        return jsonify({
            "error": ERROR_UNEXPECTED,
            "message": "An unexpected error occurred. Please try again.",
        }), 500
@api_blueprint.route("/zero-one-knapsack", methods=["POST"])
def zero_one_knapsack():
    """
    POST /api/v1/zero-one-knapsack

    Delegates processing to the zero_one_knapsack service.
    """
    from services.zero_one_knapsack_service import run_analysis as run_knapsack_analysis
    
    data = request.get_json(silent=True)

    if data is None:
        logger.warning("Request received with missing or malformed JSON body.")
        return jsonify({
            "error": "Invalid request.",
            "message": ERROR_INVALID_JSON,
        }), 400

    try:
        response_data, status_code = run_knapsack_analysis(data)
        return jsonify(response_data), status_code
    except Exception as exc:
        logger.exception("Unexpected error during 0/1 Knapsack analysis: %s", exc)
        return jsonify({
            "error": ERROR_UNEXPECTED,
            "message": "An unexpected error occurred. Please try again.",
        }), 500


@api_blueprint.route("/fractional-knapsack", methods=["POST"])
def fractional_knapsack():
    """
    POST /api/v1/fractional-knapsack

    Delegates processing to the fractional_knapsack service.
    """
    from services.fractional_knapsack_service import run_analysis as run_frac_analysis

    data = request.get_json(silent=True)

    if data is None:
        logger.warning("Request received with missing or malformed JSON body.")
        return jsonify({
            "error": "Invalid request.",
            "message": ERROR_INVALID_JSON,
        }), 400

    try:
        response_data, status_code = run_frac_analysis(data)
        return jsonify(response_data), status_code
    except Exception as exc:
        logger.exception("Unexpected error during Fractional Knapsack analysis: %s", exc)
        return jsonify({
            "error": ERROR_UNEXPECTED,
            "message": "An unexpected error occurred. Please try again.",
        }), 500


@api_blueprint.route("/activity-selection", methods=["POST"])
def activity_selection():
    """
    POST /api/v1/activity-selection

    Delegates processing to the activity_selection service.
    """
    from services.activity_selection_service import run_analysis as run_activity_analysis

    data = request.get_json(silent=True)

    if data is None:
        logger.warning("Request received with missing or malformed JSON body.")
        return jsonify({
            "error": "Invalid request.",
            "message": ERROR_INVALID_JSON,
        }), 400

    try:
        response_data, status_code = run_activity_analysis(data)
        return jsonify(response_data), status_code
    except Exception as exc:
        logger.exception("Unexpected error during Activity Selection analysis: %s", exc)
        return jsonify({
            "error": ERROR_UNEXPECTED,
            "message": "An unexpected error occurred. Please try again.",
        }), 500


@api_blueprint.route("/rod-cutting", methods=["POST"])
def rod_cutting():
    """
    POST /api/v1/rod-cutting

    Delegates processing to the rod_cutting service.
    """
    from services.rod_cutting_service import run_analysis as run_rod_analysis

    data = request.get_json(silent=True)

    if data is None:
        logger.warning("Request received with missing or malformed JSON body.")
        return jsonify({
            "error": "Invalid request.",
            "message": ERROR_INVALID_JSON,
        }), 400

    try:
        response_data, status_code = run_rod_analysis(data)
        return jsonify(response_data), status_code
    except Exception as exc:
        logger.exception("Unexpected error during Rod Cutting analysis: %s", exc)
        return jsonify({
            "error": ERROR_UNEXPECTED,
            "message": "An unexpected error occurred. Please try again.",
        }), 500



