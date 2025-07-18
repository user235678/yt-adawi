// import React, { useState, useRef, useEffect } from "react";

// type SortOption = "featured" | "newest" | "price-low" | "price-high";

// interface SortMenuProps {
//   onSortChange: (option: SortOption) => void;
//   currentSort: SortOption;
// }

// const SortMenu: React.FC<SortMenuProps> = ({ onSortChange, currentSort }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const menuRef = useRef<HTMLDivElement>(null);

//   const sortOptions = [
//     { value: "featured", label: "En vedette" },
//     { value: "newest", label: "Nouveautés" },
//     { value: "price-low", label: "Prix: croissant" },
//     { value: "price-high", label: "Prix: décroissant" }
//   ];

//   const currentLabel = sortOptions.find(option => option.value === currentSort)?.label || "Trier par";

//   // Fermer le menu si on clique en dehors
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
//         setIsOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   return (
//     <div className="relative" ref={menuRef}>
//       <button 
//         className="px-4 py-2 rounded-full border border-adawi-brown text-adawi-brown hover:bg-adawi-brown hover:text-white transition-colors text-sm flex items-center"
//         onClick={() => setIsOpen(!isOpen)}
//       >
//         {currentLabel}
//         <svg 
//           className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
//           fill="none" 
//           stroke="currentColor" 
//           viewBox="0 0 24 24"
//         >
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//         </svg>
//       </button>

//       {isOpen && (
//         <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
//           <div className="py-1">
//             {sortOptions.map((option) => (
//               <button
//                 key={option.value}
//                 className={`block w-full text-left px-4 py-2 text-sm ${
//                   currentSort === option.value 
//                     ? 'bg-adawi-beige text-adawi-brown' 
//                     : 'text-gray-700 hover:bg-adawi-beige/50'
//                 }`}
//                 onClick={() => {
//                   onSortChange(option.value as SortOption);
//                   setIsOpen(false);
//                 }}
//               >
//                 {option.label}
//               </button>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SortMenu;
