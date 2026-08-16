import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AppState {
  isMenuOpen: boolean;
  searchQuery: string;
  selectedFilter: string;
}

const initialState: AppState = {
  isMenuOpen: false,
  searchQuery: "",
  selectedFilter: "all",
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    toggleMenu: (state) => {
      state.isMenuOpen = !state.isMenuOpen;
    },
    openMenu: (state) => {
      state.isMenuOpen = true;
    },
    closeMenu: (state) => {
      state.isMenuOpen = false;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedFilter: (state, action: PayloadAction<string>) => {
      state.selectedFilter = action.payload;
    },
  },
});

export const { toggleMenu, openMenu, closeMenu, setSearchQuery, setSelectedFilter } =
  appSlice.actions;

export default appSlice.reducer;
