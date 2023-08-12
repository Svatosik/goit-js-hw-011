import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import PixabayAPI from './js/pixabay-api';

const pixabayInstanse = new PixabayAPI();

let lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

const searchFormEl = document.querySelector('.search-form');
const inputEl = document.querySelector('input');
const galleryEl = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

loadMoreBtn.classList.add('hidden');
galleryEl.addEventListener('click', handleGalleryClick);
searchFormEl.addEventListener('submit', handleSearchFormSubmit);
loadMoreBtn.addEventListener('click', handleLoadMore);
function createMarkup(data) {
  return data
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
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
    )
    .join('');
}

function handleGalleryClick(event) {
  event.preventDefault();
  if (event.target.nodeName !== 'IMG') {
    return;
  }
}
async function handleLoadMore() {
  try {
    const {
      data: { hits },
    } = await pixabayInstanse.fetchImages();
    pixabayInstanse.page += 1;

    if (hits.length < pixabayInstanse.per_page) {
      loadMoreBtn.classList.add('hidden');
      Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
    }

    galleryEl.insertAdjacentHTML('beforeend', createMarkup(hits));
    lightbox.refresh();

    const totalPages = Math.ceil(
      pixabayInstanse.totalHits / pixabayInstanse.per_page
    );
    if (pixabayInstanse.page > totalPages) {
      loadMoreBtn.classList.add('hidden');
    } else {
      loadMoreBtn.classList.remove('hidden');
    }
    const { height: cardHeight } =
      galleryEl.lastElementChild.getBoundingClientRect();
    window.scrollBy({
      top: cardHeight,
      behavior: 'smooth',
    });
  } catch (error) {
    console.error(error);
  }
}

async function handleSearchFormSubmit(event) {
  event.preventDefault();
  const inputValue = inputEl.value.trim();
  if (!inputValue) {
    Notiflix.Notify.failure('Please enter a valid search query.');
    return;
  }
  galleryEl.innerHTML = '';
  loadMoreBtn.classList.add('hidden');
  pixabayInstanse.query = inputValue;
  pixabayInstanse.page = 1;
  try {
    const {
      data: { totalHits, hits },
    } = await pixabayInstanse.fetchImages();

    if (!totalHits) {
      Notiflix.Notify.failure(
        `Sorry, there are no images matching your search query.`
      );
    } else {
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    }

    if (totalHits > pixabayInstanse.per_page) {
      loadMoreBtn.classList.remove('hidden');
    }

    pixabayInstanse.page += 1;
    pixabayInstanse.totalHits = totalHits;

    galleryEl.insertAdjacentHTML('beforeend', createMarkup(hits));
    lightbox.refresh();
  } catch (error) {
    console.error(error);
  }

  event.target.reset();
}
