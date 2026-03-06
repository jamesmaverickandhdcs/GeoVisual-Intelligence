import dynamic from "next/dynamic";

const GeoMap = dynamic(() => import("@/components/map/GeoMap"), {
  ssr: false,
  loading: () => (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", background:"#0F1F33" }}>
      <div style={{ color:"#C9A227", fontSize:"18px" }}>Loading map...</div>
    </div>
  ),
});

export default function MapPage() {
  return (
    <div style={{ width:"100%", height:"100%", position:"relative" }}>
      <GeoMap />
    </div>
  );
}
