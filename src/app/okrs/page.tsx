"use client";
import Navbar from "../components/Navbar";
import OKRBoard from "../components/OKRBoard";
import AddAndEditOKRModal from "../components/AddAndEditOKRModal";

export default function OKRsPage() {
  return (
    <div className="app-dark flex h-screen flex-col">
      <Navbar />
      <div className="flex-1 overflow-y-auto">
        <OKRBoard />
        <AddAndEditOKRModal />
      </div>
    </div>
  );
}
