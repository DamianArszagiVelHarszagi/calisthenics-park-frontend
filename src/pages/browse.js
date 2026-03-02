const API_BASE = "https://web2-course-project-back-end-6vm7.onrender.com";

const grid = document.querySelector(".parks_grid");
const parksCount = document.getElementById("parksCount");
const searchInput = document.querySelector(".search input");
const areaCards = document.querySelectorAll(".area-card");
const sortButtons = document.querySelectorAll(".filter_buttons button");
const equipmentButtons = document.querySelectorAll(".equipment button");

let allParks = [];

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

let state = {
	search: "",
	area: "",
	sort: "",
	equipment: "",
};

function safeText(value) {
	if (!value) return "";
	return String(value);
}

function starsFromRating(rating) {
	const r = Math.round(rating);
	if (r < 0) return "☆☆☆☆☆";
	if (r > 5) return "★★★★★";

	let stars = "";
	for (let i = 0; i < r; i++) {
		stars += "★";
	}
	for (let i = r; i < 5; i++) {
		stars += "☆";
	}
	return stars;
}
function equipmentLabel(value) {
	const v = safeText(value).trim().toLowerCase();

	if (v === "pullup_bar") return "Pull-up bar";
	if (v === "monkey_bar") return "Monkey bar";
	if (v === "dip_bar") return "Dip bar";
	if (v === "parallel_bars") return "Parallel bars";

	return value;
}

function parkCardHTML(park) {
	const name = park.name || "Unknown park";
	const city = park.city || "";
	const rating = park.rating ? Number(park.rating) : 0;
	const reviewsCount = Number(park.reviewsCount) || 0;

	const isOpen = park.open24_7 ? true : false;
	const badgeClass = isOpen ? "open" : "closed";
	const badgeText = isOpen ? "Open 24/7" : "Not 24/7";

	let equipmentHTML = `<div class="tag">No equipment listed</div>`;
	if (park.equipment && park.equipment.length > 0) {
		equipmentHTML = "";
		for (let i = 0; i < park.equipment.length; i++) {
			equipmentHTML += `<div class="tag">${equipmentLabel(
				park.equipment[i]
			)}</div>`;
		}
	}

	return `
		<article class="park_card" data-id="${park._id}">
			<div class="park_img">
				<div class="park_badge ${badgeClass}">${badgeText}</div>
			</div>

			<div class="park_content">
				<div class="park_top">
					<h3 class="park_name">${name}</h3>
					<div class="park_rating">
						<div class="rating_number">${rating.toFixed(1)}</div>
						<div class="rating_stars">${starsFromRating(rating)}</div>
					</div>
				</div>

				<p class="park_city">${city} - ${reviewsCount} reviews"</p>

				<div class="equipment_tags">
					${equipmentHTML}
				</div>

				<div class="park_buttons">
					<button class="button_left">View details</button>
					<button class="button_right">Add review</button>
				</div>
			</div>
		</article>
	`;
}
function normalizeEquipment(value) {
	const v = safeText(value).trim().toLowerCase();

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

function normalizeArea(value) {
	const v = safeText(value).trim().toLowerCase();
	return area_similarity[v] || v;
}

function applyFiltersAndRender() {
	let parks = allParks.slice();

	if (state.search !== "") {
		const searchTerm = state.search.toLowerCase();
		parks = parks.filter(function (park) {
			const parkName = safeText(park.name).toLowerCase();
			return parkName.indexOf(searchTerm) !== -1;
		});
	}

	if (state.area !== "") {
		const selected = normalizeArea(state.area);

		parks = parks.filter(function (park) {
			const parkArea = normalizeArea(park.city);
			return parkArea === selected;
		});
	}
	if (state.equipment !== "") {
		const selectedEq = normalizeEquipment(state.equipment);

		parks = parks.filter(function (park) {
			if (!park.equipment || !Array.isArray(park.equipment)) return false;

			for (let i = 0; i < park.equipment.length; i++) {
				const eq = normalizeEquipment(park.equipment[i]);
				if (eq === selectedEq) return true;
			}
			return false;
		});
	}
	// sorteren
	if (state.sort === "top") {
		parks.sort(function (a, b) {
			const ratingA = Number(a.rating) || 0;
			const ratingB = Number(b.rating) || 0;
			return ratingB - ratingA;
		});
	}
	//reviews op meeste
	if (state.sort === "reviews") {
		parks.sort(function (a, b) {
			const countA = Number(a.reviewsCount) || 0;
			const countB = Number(b.reviewsCount) || 0;
			return countB - countA;
		});
	}

	// de parken renderen
	let html = "";
	for (let i = 0; i < parks.length; i++) {
		html += parkCardHTML(parks[i]);
	}
	grid.innerHTML = html;

	if (parksCount) {
		parksCount.textContent = parks.length;
	}
}

async function loadParksFromBackend() {
	try {
		grid.innerHTML = `<p>Loading parks...</p>`;

		const response = await fetch(`${API_BASE}/api/parks`);
		if (!response.ok) {
			throw new Error("Failed to load parks");
		}

		allParks = await response.json();
		applyFiltersAndRender();
	} catch (error) {
		console.error(error);
		grid.innerHTML = `<p>Could not load parks.</p>`;
	}
}

let searchTimeout;
if (searchInput) {
	searchInput.addEventListener("input", function (e) {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(function () {
			state.search = e.target.value.trim();
			applyFiltersAndRender();
		}, 300);
	});
}

for (let i = 0; i < areaCards.length; i++) {
	areaCards[i].addEventListener("click", function () {
		const area = this.textContent.trim();

		if (state.area === area) {
			state.area = "";
			for (let j = 0; j < areaCards.length; j++) {
				areaCards[j].classList.remove("active_area");
			}
		} else {
			state.area = area;
			for (let j = 0; j < areaCards.length; j++) {
				areaCards[j].classList.remove("active_area");
			}
			this.classList.add("active_area");
		}

		applyFiltersAndRender();
	});
}

for (let i = 0; i < sortButtons.length; i++) {
	sortButtons[i].addEventListener("click", function () {
		const buttonText = this.textContent.toLowerCase();

		for (let j = 0; j < sortButtons.length; j++) {
			sortButtons[j].classList.remove("active_sort");
		}

		if (buttonText.indexOf("top") !== -1) {
			state.sort = "top";
			this.classList.add("active_sort");
		} else if (buttonText.indexOf("review") !== -1) {
			state.sort = "reviews";
			this.classList.add("active_sort");
		} else {
			state.sort = "";
		}

		applyFiltersAndRender();
	});
}
for (let i = 0; i < equipmentButtons.length; i++) {
	equipmentButtons[i].addEventListener("click", function () {
		const eq = normalizeEquipment(this.textContent);

		if (state.equipment === eq) {
			state.equipment = "";
			for (let j = 0; j < equipmentButtons.length; j++) {
				equipmentButtons[j].classList.remove("active_equipment");
			}
		} else {
			state.equipment = eq;
			for (let j = 0; j < equipmentButtons.length; j++) {
				equipmentButtons[j].classList.remove("active_equipment");
			}
			this.classList.add("active_equipment");
		}

		applyFiltersAndRender();
	});
}

loadParksFromBackend();

/*-----------------OVERLAY gedeelte-----------------*/

const modal = document.getElementById("addParkModal");
const openBtn = document.querySelector(".addpark_btn_overlay");
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

if (openBtn) {
	openBtn.addEventListener("click", openModal);
}

if (closeBtn) {
	closeBtn.addEventListener("click", closeModal);
}

if (cancelBtn) {
	cancelBtn.addEventListener("click", closeModal);
}

// sluiten van de overlay wanneer je buiten klikt
if (modal) {
	modal.addEventListener("click", function (e) {
		if (e.target === modal) {
			closeModal();
		}
	});
}

document.addEventListener("keydown", function (e) {
	if (e.key === "Escape" && modal.classList.contains("show")) {
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

	// als je later overschakelt naar park object terugsturen
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

		if (!newPark.name || !newPark.city) {
			return;
		}
		// Trim blank spaties
		newPark.name = newPark.name.trim();
		newPark.city = newPark.city.trim();

		try {
			const created = await createParkOnBackend(newPark);

			allParks.push(created);
			applyFiltersAndRender();

			form.reset();
			closeModal();
		} catch (error) {
			console.error(error);
			alert(error.message);
		}
	});
}
/*-----------------OVERLAY review gedeelte-----------------*/
const reviewModal = document.getElementById("addReviewModal");
const reviewForm = document.getElementById("addReviewForm");
const reviewCloseBtn = document.querySelector(".modal_close_review");
const reviewCancelBtn = document.getElementById("cancelReview");
const reviewText = document.getElementById("reviewText");

const reviewParkId = document.getElementById("reviewParkId");
const reviewTitle = document.getElementById("reviewTitle");

const reviewRating = document.getElementById("reviewRating");
const reviewRatingValue = document.getElementById("reviewRatingValue");

function openReviewModal() {
	reviewModal.classList.add("show");
	document.body.classList.add("modal-open");
	reviewModal.setAttribute("aria-hidden", "false");
}

function closeReviewModal() {
	reviewModal.classList.remove("show");
	document.body.classList.remove("modal-open");
	reviewModal.setAttribute("aria-hidden", "true");
}

// live rating value
if (reviewRating && reviewRatingValue) {
	reviewRating.addEventListener("input", function () {
		reviewRatingValue.textContent = Number(this.value).toFixed(1);
	});
}

if (grid) {
	grid.addEventListener("click", function (e) {
		const btn = e.target.closest(".button_right");
		if (!btn) return;

		const card = btn.closest(".park_card");
		if (!card) return;

		const id = card.dataset.id;
		if (!id) return;

		//titel
		const park = allParks.find((p) => String(p._id) === String(id));
		const parkName = park && park.name ? park.name : "this park";

		reviewParkId.value = id;
		reviewTitle.textContent = `Add review: ${parkName}`;

		reviewForm.reset();

		if (reviewRating) reviewRating.value = "5";
		if (reviewRatingValue) reviewRatingValue.textContent = "5.0";

		openReviewModal();
	});
}

if (reviewCloseBtn) reviewCloseBtn.addEventListener("click", closeReviewModal);
if (reviewCancelBtn)
	reviewCancelBtn.addEventListener("click", closeReviewModal);

// hetzelfde sluiten als bij addpark modal
if (reviewModal) {
	reviewModal.addEventListener("click", function (e) {
		if (e.target === reviewModal) {
			closeReviewModal();
		}
	});
}
async function createReviewOnBackend(review) {
	const response = await fetch(`${API_BASE}/api/reviews`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(review),
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.message || "Failed to add review");
	}

	return data;
}
if (reviewForm) {
	reviewForm.addEventListener("submit", async function (e) {
		e.preventDefault();

		const parkId = reviewParkId ? reviewParkId.value : "";
		const rating = reviewRating ? Number(reviewRating.value) || 0 : 0;
		const comment = reviewText ? reviewText.value.trim() : "";

		if (!parkId || !comment) return;

		try {
			await createReviewOnBackend({
				parkId: parkId,
				rating: rating,
				comment: comment,
			});

			// simpel: reload parks zodat rating/reviewsCount mee updaten
			await loadParksFromBackend();

			reviewForm.reset();
			closeReviewModal();
		} catch (error) {
			console.error(error);
			alert(error.message);
		}
	});
}
