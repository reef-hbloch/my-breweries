import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { BreweryState, IBrewery } from './interfaces/Brewery.interfaces';
import breweryService from '../../services/brewery.service';

import { LOCAL_STORAGE_KEY } from '../../constants';

const initialState: BreweryState = {
  breweries: [],
  favoredBreweries: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
};

export const getBreweries = createAsyncThunk('breweries', async () => {
  try {
    const breweries = await breweryService.getBreweries();
    return breweries;
  } catch (err) {
    console.error('Error: ', err);
  }
});

export const getFavoredBreweriesFromAPI = createAsyncThunk(
  'favoredBreweries',
  async (favoriteBreweriesIds: string[]) => {
    try {
      const favoredBreweries = await breweryService.getFavoredBreweriesFromAPI(
        favoriteBreweriesIds
      );
      return favoredBreweries;
    } catch (err) {
      console.error('Error: ', err);
    }
  }
);

const toggleFavoriteBrewery = (
  favoredBreweries: IBrewery[],
  selectedBrewery: IBrewery
) => {
  const previousFavorites = [...favoredBreweries];
  const favoredBrewery = previousFavorites.find(
    (brewery) => brewery.id === selectedBrewery.id
  );

  let newFavoredBreweries = [];

  if (!favoredBrewery) {
    previousFavorites.push({ ...selectedBrewery });

    newFavoredBreweries = previousFavorites;
  } else {
    const filteredBreweries = previousFavorites.filter(
      (brewery) => brewery.id !== favoredBrewery.id
    );

    newFavoredBreweries = [...filteredBreweries];
  }

  const favoredBreweriesIds = newFavoredBreweries.map(
    (brewery: IBrewery) => brewery.id
  );

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(favoredBreweriesIds));

  return newFavoredBreweries;
};

export const brewerySlice = createSlice({
  name: 'brewery',
  initialState,
  reducers: {
    toggleFavorite: (state, action: PayloadAction<IBrewery>) => {
      const modifiedFavoredBreweries = toggleFavoriteBrewery(
        state.favoredBreweries,
        action.payload
      );
      state.favoredBreweries = modifiedFavoredBreweries;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBreweries.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getBreweries.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.breweries = action.payload || [];
      })
      .addCase(getBreweries.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
        state.breweries = [];
      })
      .addCase(getFavoredBreweriesFromAPI.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFavoredBreweriesFromAPI.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.favoredBreweries = action.payload || state.favoredBreweries;
      })
      .addCase(getFavoredBreweriesFromAPI.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
        state.favoredBreweries = [];
      });
  },
});

export const { toggleFavorite } = brewerySlice.actions;

export default brewerySlice.reducer;
