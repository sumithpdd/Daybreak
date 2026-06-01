import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import type { IOKR } from "../services/apiSlice";

const initialState = {
currentBoardName: "",
// Manage the state for opening and closing the Add and Edit Board modal
isAddAndEditBoardModal: { isOpen: false, variant: "" },
isAddAndEditTaskModal: { isOpen: false, variant: "", title: "", index: -1, name: ""},
isDeleteBoardAndTaskModal: { isOpen: false, variant: "",  title:'', status: "", index: -1 },
isTagManagementModal: { isOpen: false },
isOKRModal: { isOpen: false, okrToEdit: null as IOKR | null },
};

export const features = createSlice({
 name: "features",
 initialState,

 reducers: {
  setCurrentBoardName: (state, action: PayloadAction<string>) => {
   state.currentBoardName = action.payload;
 },
 // Open the Add and Edit Board modal with a specified variant (add or edit)
 openAddAndEditBoardModal: (state, { payload }) => {
   state.isAddAndEditBoardModal.isOpen = true;
   // Set the kind of modal to open (add board or edit board) based on the variant parameter
   state.isAddAndEditBoardModal.variant = payload;
 },
 // Close the Add and Edit Board modal
 closeAddAndEditBoardModal: (state) => {
   state.isAddAndEditBoardModal.isOpen = false;
   state.isAddAndEditBoardModal.variant = "";
 },
 // Open the Add and Edit task modal with a specified variant (add or edit), title, description, status
 openAddAndEditTaskModal: (state, { payload }) => {
  state.isAddAndEditTaskModal.isOpen = true;
  state.isAddAndEditTaskModal.variant = payload.variant;
  state.isAddAndEditTaskModal.title = payload.title;
  state.isAddAndEditTaskModal.index = payload.index;
 state.isAddAndEditTaskModal.name = payload.name;
},
// Close the Add and Edit task modal
closeAddAndEditTaskModal: (state) => {
  state.isAddAndEditTaskModal.isOpen = false;
  state.isAddAndEditTaskModal.variant = "";
  state.isAddAndEditTaskModal.title = "";
  state.isAddAndEditTaskModal.index = -1;
  state.isAddAndEditTaskModal.name = "";
},
// Open the delete board and task modal with a specified variant (delete board or task)
openDeleteBoardAndTaskModal: (state, { payload }) => {
  state.isDeleteBoardAndTaskModal.isOpen = true;
  state.isDeleteBoardAndTaskModal.variant = payload.variant;
  state.isDeleteBoardAndTaskModal.title = payload.title;
  state.isDeleteBoardAndTaskModal.status = payload.status;
  state.isDeleteBoardAndTaskModal.index = payload.index;
},
// Close the delete board and task modal
closeDeleteBoardAndTaskModal: (state) => {
  state.isDeleteBoardAndTaskModal.isOpen = false;
  state.isDeleteBoardAndTaskModal.variant = "";
  state.isDeleteBoardAndTaskModal.title = "";
  state.isDeleteBoardAndTaskModal.status = "";
  state.isDeleteBoardAndTaskModal.index = -1;
},
// Open the tag management modal
openTagManagementModal: (state) => {
  state.isTagManagementModal.isOpen = true;
},
// Close the tag management modal
closeTagManagementModal: (state) => {
  state.isTagManagementModal.isOpen = false;
},
// OKR modal actions
setOKRModalOpen: (state, action: PayloadAction<boolean>) => {
  state.isOKRModal.isOpen = action.payload;
},
setOKRToEdit: (state, action: PayloadAction<IOKR | null>) => {
  state.isOKRModal.okrToEdit = action.payload;
},
},
});
export const {
setCurrentBoardName,
openAddAndEditBoardModal,
closeAddAndEditBoardModal,
openAddAndEditTaskModal,
closeAddAndEditTaskModal,
openDeleteBoardAndTaskModal,
closeDeleteBoardAndTaskModal,
openTagManagementModal,
closeTagManagementModal,
setOKRModalOpen,
setOKRToEdit,
} = features.actions;

export const getCurrentBoardName = (state: RootState) => state.features.currentBoardName;
// Selector functions to retrieve isOpen value of state from the isAddAndEditBoardModal state
export const getAddAndEditBoardModalValue = (state: RootState) => state.features.isAddAndEditBoardModal.isOpen;
// Selector functions to retrieve variant value of state from the isAddAndEditBoardModal state
export const getAddAndEditBoardModalVariantValue = (state: RootState) => state.features.isAddAndEditBoardModal.variant;

// Selector functions for task modal
export const getAddAndEditTaskModalValue = (state: RootState) => state.features.isAddAndEditTaskModal.isOpen;
export const getAddAndEditTaskModalVariantValue = (state: RootState) => state.features.isAddAndEditTaskModal.variant;
export const getAddAndEditTaskModalTitle = (state: RootState) => state.features.isAddAndEditTaskModal.title;
export const getAddAndEditTaskModalIndex = (state: RootState) => state.features.isAddAndEditTaskModal.index;
export const getAddAndEditTaskModalName = (state: RootState) => state.features.isAddAndEditTaskModal.name;

 // Delete task and board
 export const getDeleteBoardAndTaskModalValue = (state: RootState) => state.features.isDeleteBoardAndTaskModal.isOpen;
 // Selector function to retrieve variant state value 
 export const getDeleteBoardAndTaskModalVariantValue = (state: RootState) => state.features.isDeleteBoardAndTaskModal.variant;
 // Selector function to retrieve title state value 
 export const getDeleteBoardAndTaskModalTitle = (state: RootState) => state.features.isDeleteBoardAndTaskModal.title;
 // Selector function to retrieve status state value
 export const getDeleteBoardAndTaskModalStatus = (state: RootState) => state.features.isDeleteBoardAndTaskModal.status;
 // Selector function to retrieve index state value
 export const getDeleteBoardAndTaskModalIndex = (state: RootState) => state.features.isDeleteBoardAndTaskModal.index;

// Tag management modal selectors
export const getTagManagementModalValue = (state: RootState) => state.features.isTagManagementModal.isOpen;

// OKR modal selectors
export const getOKRModalValue = (state: RootState) => state.features.isOKRModal.isOpen;
export const getOKRToEdit = (state: RootState) => state.features.isOKRModal.okrToEdit;

// Export the reducer for use in the Redux store
export default features.reducer;