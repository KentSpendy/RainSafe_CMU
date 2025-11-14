from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError
import time


def reverse_geocode(latitude, longitude, retries=3):
    """
    Convert latitude and longitude to a human-readable address.

    Args:
        latitude (float): Latitude coordinate
        longitude (float): Longitude coordinate
        retries (int): Number of retry attempts if geocoding fails

    Returns:
        str: Formatted address or fallback coordinates string
    """
    geolocator = Nominatim(user_agent="rainsafe_cmu_app")

    for attempt in range(retries):
        try:
            # Perform reverse geocoding
            location = geolocator.reverse(f"{latitude}, {longitude}", timeout=10, language="en")

            if location and location.address:
                return location.address
            else:
                # If no address found, return coordinates
                return f"{latitude}, {longitude}"

        except GeocoderTimedOut:
            # If geocoding times out, retry after a short delay
            if attempt < retries - 1:
                time.sleep(1)
                continue
            else:
                # Final attempt failed, return coordinates
                return f"{latitude}, {longitude}"

        except GeocoderServiceError as e:
            # Service error, return coordinates
            print(f"Geocoding service error: {e}")
            return f"{latitude}, {longitude}"

        except Exception as e:
            # Any other error, return coordinates
            print(f"Unexpected geocoding error: {e}")
            return f"{latitude}, {longitude}"

    # If all retries failed, return coordinates
    return f"{latitude}, {longitude}"
