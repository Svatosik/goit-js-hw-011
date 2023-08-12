import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { PixabayAPI } from './js/pixabay-api';

const pixabayInstanse = new PixabayAPI();
const lightbox = new SimpleLightbox('.gallery a', {
  captionDelay: 250,
});

const galleryContainer = document.querySelector('.gallery');
const inputEl = document.querySelector('.search-form input');
const loadMoreBtn = document.querySelector('.load-more');
loadMoreBtn.classList.add('hidden');

document.addEventListener('submit', handleButtonActions);

function handleButtonActions(event) {
  event.preventDefault();

  if (event.target === loadMoreBtn) {
    handleLoadMore();
  } else if (event.target === searchFormEl) {
    handleSearchFormSubmit();
  }
}

async function handleSearchFormSubmit(event) {
  try {
    const inputValue = inputEl.value.trim();

    if (!inputValue) {
      Notiflix.Notify.failure('Please enter a valid search query.');
      return;
    }

    galleryContainer.innerHTML = '';
    loadMoreBtn.classList.add('hidden');
    pixabayInstanse.query = inputValue;
    pixabayInstanse.page = 1;

    const data = await pixabayInstanse.fetchImages();

    if (data.totalHits) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else {
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    }

    if (data.totalHits > pixabayInstanse.per_page) {
      loadMoreBtn.classList.remove('hidden');
    }

    pixabayInstanse.page += 1;
    pixabayInstanse.totalHits = totalHits;

    const markup = createMarkup(data.hits);
    renderMarkup(markup);

    event.target.reset();
  } catch (error) {
    console.error(error);
  }
}

async function handleLoadMore() {
  try {
    const {
      data: { hits },
    } = await pixabayInstanse.fetchImages();
    pixabayInstanse.page += 1;

    if (hits.length < pixabayInstanse.per_page) {
      Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
      loadMoreBtn.classList.add('hidden');
    }
    const markup = createMarkup(hits);
    renderMarkup(markup);

    const totalPages = Math.ceil(
      pixabayInstanse.totalHits / pixabayInstanse.per_page
    );

    if (pixabayInstanse.page > totalPages) {
      loadMoreBtn.classList.add('hidden');
    } else {
      loadMoreBtn.classList.remove('hidden');
    }
  } catch (error) {
    console.error(error);
  }
}

function createMarkup({
  webformatURL,
  largeImageURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) {
  return `
    <div class="photo-card">
      <a href=${largeImageURL}><img src=${webformatURL} alt=${tags} loading="lazy" /></a>
      <div class="info">
        <p class="info-item">
          <ion-icon name="heart-outline" class="info-icon"></ion-icon>
          ${likes}
        </p>
        <p class="info-item">
          <ion-icon name="eye-outline" class="info-icon"></ion-icon>
          ${views}
        </p>
        <p class="info-item">
          <ion-icon name="chatbox-ellipses-outline" class="info-icon"></ion-icon>
          ${comments}
        </p>
        <p class="info-item">
          <ion-icon name="arrow-down-circle-outline" class="info-icon"></ion-icon>
          ${downloads}
        </p>
      </div>
    </div>`;
}

function renderMarkup(markup) {
  galleryContainer.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh();
}
const { height: cardHeight } =
  galleryContainer.firstElementChild.getBoundingClientRect();

window.scrollBy({
  top: cardHeight * 2,
  behavior: 'smooth',
});
