//leaflet library
const map = L.map("map").setView([50.8503, 4.3517], 12);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
	maxZoom: 19,
	attribution: "© OpenStreetMap",
}).addTo(map);

const API_BASE = "https://web2-course-project-back-end-6vm7.onrender.com";

let allParks = [];

let mapState = {
	sort: "",
	equipment: "",
	only247: false,
};

const markersLayer = L.layerGroup().addTo(map);

//--------------------normalizing --------------------

function normalizeEquipment(value) {
	const v = String(value || "")
		.trim()
		.toLowerCase();

	if (v === "pull-up bar") return "pullup_bar";
	if (v === "pullup bar") return "pullup_bar";
	if (v === "pullup_bar") return "pullup_bar";

	if (v === "monkey bar") return "monkey_bar";
	if (v === "monkey_bar") return "monkey_bar";

	if (v === "dip bar") return "dip_bar";
	if (v === "dip_bar") return "dip_bar";

	if (v === "parallel bars") return "parallel_bars";
	if (v === "parallel_bars") return "parallel_bars";

	return v;
}

const area_similarity = {
	bruxelles: "brussels",
	brussels: "brussels",
	brussel: "brussels",

	ixelles: "ixelles",
	elsene: "ixelles",

	schaerbeek: "schaerbeek",
	schaarbeek: "schaerbeek",

	forest: "forest",
	vorst: "forest",

	uccle: "uccle",
	ukkel: "uccle",

	auderghem: "auderghem",
	oudergem: "auderghem",

	"molenbeek-saint-jean": "molenbeek",
	"sint-jans-molenbeek": "molenbeek",
	molenbeek: "molenbeek",

	"saint-gilles": "saint-gilles",
	"sint-gillis": "saint-gilles",

	"saint-josse-ten-noode": "saint-josse",
	"sint-joost-ten-node": "saint-josse",
	"saint-josse": "saint-josse",

	"woluwe-saint-lambert": "woluwe-saint-lambert",
	"sint-lambrechts-woluwe": "woluwe-saint-lambert",
	wsl: "woluwe-saint-lambert",

	"woluwe-saint-pierre": "wsp",
	"sint-pieters-woluwe": "wsp",
	wsp: "wsp",

	"watermael-boitsfort": "watermael",
	"watermaal-bosvoorde": "watermael",
	watermael: "watermael",

	"berchem-saint-agathe": "berchem",
	"sint-agatha-berchem": "berchem",
	berchem: "berchem",
};

const area_cords = {
	anderlecht: [50.8367, 4.303],
	brussels: [50.8467, 4.3525],
	ixelles: [50.8345, 4.3662],
	schaerbeek: [50.8676, 4.3775],
	forest: [50.8116, 4.3256],
	uccle: [50.8023, 4.3387],
	auderghem: [50.8167, 4.436],
	evere: [50.874, 4.4034],
	ganshoren: [50.872, 4.3121],
	jette: [50.8806, 4.33],
	koekelberg: [50.861, 4.331],
	berchem: [50.8655, 4.2921],
	"saint-gilles": [50.8309, 4.3431],
	molenbeek: [50.8546, 4.3227],
	"saint-josse": [50.8491, 4.372],
	"woluwe-saint-lambert": [50.8479, 4.4324],
	wsp: [50.8297, 4.4369],
	watermael: [50.8055, 4.4182],
};

function normalizeArea(value) {
	const v = String(value || "")
		.trim()
		.toLowerCase();
	return area_similarity[v] || v;
}

function getAreaCoords(area) {
	const key = normalizeArea(area);
	return area_cords[key] || null;
}

/*--------------------marker en filters--------------------*/

function addParkMarker(park) {
	const coords = getAreaCoords(park.city);
	if (!coords) return;

	L.marker(coords)
		.addTo(markersLayer)
		.bindPopup(`<b>${park.name}</b><br>${park.city}`);
}

function parkHasEquipment(park, selectedKey) {
	if (!park.equipment || !Array.isArray(park.equipment)) return false;

	for (let i = 0; i < park.equipment.length; i++) {
		const eq = normalizeEquipment(park.equipment[i]);
		if (eq === selectedKey) return true;
	}
	return false;
}

function renderMapParks() {
	let parks = allParks.slice();

	// filter 24/7
	if (mapState.only247) {
		parks = parks.filter(function (p) {
			return Boolean(p.open24_7) === true;
		});
	}

	// filter equipment
	if (mapState.equipment !== "") {
		const selectedKey = normalizeEquipment(mapState.equipment);
		parks = parks.filter(function (p) {
			return parkHasEquipment(p, selectedKey);
		});
	}

	// sort top rated bij 4 sterren
	if (mapState.sort === "top_rated") {
		parks = parks.filter(function (p) {
			const r = Number(p.rating) || 0;
			return r >= 4;
		});
	}

	markersLayer.clearLayers();
	for (let i = 0; i < parks.length; i++) {
		addParkMarker(parks[i]);
	}
}

async function loadParksToMap() {
	try {
		const response = await fetch(`${API_BASE}/api/parks`);
		if (!response.ok) throw new Error("failed to load parks");

		allParks = await response.json();
		renderMapParks();
	} catch (err) {
		console.error(err);
	}
}

/*--------------------bootstrap--------------------*/

$(function () {
	$(".dropdown-toggle").dropdown();

	$(".js-sort").on("click", function () {
		const selectedText = $(this).text();
		$("#sortDropdown").text(selectedText);

		const val = $(this).data("value");
		if (val === "top_rated") {
			mapState.sort = "top_rated";
		} else {
			mapState.sort = "";
		}
	});

	$(".js-equipment").on("click", function () {
		const selectedText = $(this).text();
		$("#equipmentDropdown").text(selectedText);

		const val = $(this).data("value");
		mapState.equipment = val ? String(val) : "";
	});

	$("#only247filter").on("change", function () {
		mapState.only247 = $(this).is(":checked");
	});

	$(".form_button button").on("click", function () {
		renderMapParks();
	});
});

/*--------------------add park modal--------------------*/

const modal = document.getElementById("addParkModal");
const openBtn = document.querySelector(".add_park_btn");
const closeBtn = document.querySelector(".modal_close");
const cancelBtn = document.getElementById("cancelAddPark");
const form = document.getElementById("addParkForm");

function openModal() {
	modal.classList.add("show");
	document.body.classList.add("modal-open");
	modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
	modal.classList.remove("show");
	document.body.classList.remove("modal-open");
	modal.setAttribute("aria-hidden", "true");
}

if (openBtn) openBtn.addEventListener("click", openModal);
if (closeBtn) closeBtn.addEventListener("click", closeModal);
if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

if (modal) {
	modal.addEventListener("click", function (e) {
		if (e.target === modal) closeModal();
	});
}

document.addEventListener("keydown", function (e) {
	if (e.key === "Escape" && modal && modal.classList.contains("show")) {
		closeModal();
	}
});

async function createParkOnBackend(newPark) {
	const response = await fetch(`${API_BASE}/api/parks`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(newPark),
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.message || "Failed to create park");
	}

	if (data && data.data) {
		data.data._id = data.id;
		return data.data;
	}

	return data;
}

if (form) {
	form.addEventListener("submit", async function (e) {
		e.preventDefault();

		const formData = new FormData(form);

		const newPark = {
			name: formData.get("name"),
			city: formData.get("city"),
			equipment: formData.getAll("equipment"),
			open24_7: formData.get("open24_7") === "on",
		};

		if (!newPark.name || !newPark.city) return;

		newPark.name = newPark.name.trim();
		newPark.city = newPark.city.trim();

		try {
			const created = await createParkOnBackend(newPark);

			allParks.push(created);
			renderMapParks();

			form.reset();
			closeModal();
		} catch (error) {
			console.error(error);
			alert(error.message);
		}
	});
}

loadParksToMap();
