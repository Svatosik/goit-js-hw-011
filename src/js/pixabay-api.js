import axios from 'axios';

export default class PixabayAPI {
  #BASE_KEY = '38758635-bff794d5d56109e9f72577d45';
  #BASE_URL = 'https://pixabay.com/api/';

  defaultSearchParams = {
    key: this.#BASE_KEY,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
  };
  page = 1;
  query = null;
  per_page = 40;
  totalHits = 0;

  async fetchImages() {
    const baseSearchParams = new URLSearchParams({
      ...this.defaultSearchParams,
      per_page: this.per_page,
      page: this.page,
      q: this.query,
    });
    const data = axios.get(`${this.#BASE_URL}?${baseSearchParams}`);
    return data;
  }
}
