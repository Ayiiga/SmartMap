extends RefCounted
## Twelve original procedural astronaut styles in three mission roles.
## No runtime downloads, remote assets or external character licences.
const GROUPS: Dictionary = {
	"Flight Cadets": ["nambe", "ndaani", "mambooda", "abiola"],
	"Rocket Pilots": ["ayiiga", "atia", "mpoko", "yambilla"],
	"Science Explorers": ["zuuri", "wendkuoni", "delwende", "regina"]
}
const IDS: Array[String] = [
	"nambe", "ndaani", "mambooda", "abiola",
	"ayiiga", "atia", "mpoko", "yambilla",
	"zuuri", "wendkuoni", "delwende", "regina"
]
const CREW: Dictionary = {
	"nambe": {"name": "Nambe", "role": "Flight Cadet", "suit": "dce8f0", "trim": "2787b8", "boots": "eea24e", "visor": "102941", "tip": "Blue-white suit"},
	"ndaani": {"name": "Ndaani", "role": "Flight Cadet", "suit": "f5ead6", "trim": "278a91", "boots": "8d6b53", "visor": "102941", "tip": "Cream-and-teal suit"},
	"mambooda": {"name": "Mambooda", "role": "Flight Cadet", "suit": "b5dbf2", "trim": "d77f30", "boots": "775c57", "visor": "102941", "tip": "Sky-blue suit"},
	"abiola": {"name": "Abiola", "role": "Flight Cadet", "suit": "dfd4f6", "trim": "275cb8", "boots": "b78857", "visor": "102941", "tip": "Lilac suit"},
	"ayiiga": {"name": "Ayiiga", "role": "Rocket Pilot", "suit": "f1b459", "trim": "314b67", "boots": "b55b36", "visor": "142436", "tip": "Orange pilot suit"},
	"atia": {"name": "Atia", "role": "Rocket Pilot", "suit": "cf6950", "trim": "eec66b", "boots": "523f4d", "visor": "142436", "tip": "Copper pilot suit"},
	"mpoko": {"name": "Mpoko", "role": "Rocket Pilot", "suit": "e6d08f", "trim": "54778d", "boots": "5d647a", "visor": "142436", "tip": "Gold pilot suit"},
	"yambilla": {"name": "Yambilla", "role": "Rocket Pilot", "suit": "abb2bf", "trim": "eb7c47", "boots": "293d51", "visor": "142436", "tip": "Steel pilot suit"},
	"zuuri": {"name": "Zuuri", "role": "Science Explorer", "suit": "bd9de5", "trim": "1ba4a4", "boots": "597acc", "visor": "211c42", "tip": "Violet research suit"},
	"wendkuoni": {"name": "Wendkuoni", "role": "Science Explorer", "suit": "caeee6", "trim": "7153a4", "boots": "536584", "visor": "211c42", "tip": "Mint research suit"},
	"delwende": {"name": "Delwende", "role": "Science Explorer", "suit": "e4a5c3", "trim": "528eac", "boots": "584d6b", "visor": "211c42", "tip": "Rose research suit"},
	"regina": {"name": "Regina", "role": "Science Explorer", "suit": "f4ebf1", "trim": "b86c8f", "boots": "67566d", "visor": "211c42", "tip": "White research suit"}
}
const LEGACY_NAMES: Dictionary = {"nova": "nambe", "kofi": "ayiiga", "zuri": "zuuri"}

static func normalize_id(crew_id: String) -> String:
	var canonical: String = str(LEGACY_NAMES.get(crew_id.to_lower(), crew_id.to_lower()))
	return canonical if canonical in IDS else "nambe"

static func profile_for(crew_id: String) -> Dictionary:
	return CREW[normalize_id(crew_id)]
