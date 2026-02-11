# STAKE ENGINE MATH SDK CONFIGURATION
# Verified for Lofi Library v1.0

VERSION = "1.0.0"
RTP_TARGET = 0.9645
REEL_LAYOUT = [5, 5]
PAY_TYPE = "CLUSTER"
MIN_CLUSTER = 5

SYMBOL_VALUES = {
    "Cabin": 10.0,
    "Cat": 5.0,
    "Vinyl": 2.0,
    "Headphones": 1.0,
    "Book": 0.50,
    "Succulent": 0.25,
    "Matcha": 0.15,
    "Candle": 0.10
}

SYMBOL_WEIGHTS = {
    "Cabin": 3, 
    "Cat": 5, 
    "Vinyl": 8, 
    "Headphones": 10,
    "Book": 12, 
    "Succulent": 15, 
    "Matcha": 18, 
    "Candle": 20, 
    "Wild": 1
}

PROVABLY_FAIR = {
    "algorithm": "SHA-256",
    "inputs": ["server_seed", "client_seed", "nonce", "cell_index"]
}
