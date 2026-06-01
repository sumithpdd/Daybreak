import { combineReducers } from "@reduxjs/toolkit";
import { fireStoreApi } from "./services/apiSlice";
import  featuresReducer  from "./features/appSlice";

export const rootReducer = combineReducers({
//add the features slice here
features: featuresReducer,
[fireStoreApi.reducerPath]: fireStoreApi.reducer,
});