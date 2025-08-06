import type { MetaFunction } from "@remix-run/node";
import { useState } from "react";
import { Link } from "@remix-run/react";
import TopBanner from "~/components/TopBanner";
import Header from "~/components/CompactHeader";
import Footer from "~/components/Footer";
import { useCart } from "~/contexts/CartContext";

export const meta: MetaFunction = () => {
    return [
        { title: "Panier - Adawi" },
        { name: "description", content: "Votre panier d'achats - Finalisez votre commande" },
    ];
};

export default function Checkout() {
    const { state, dispatch } = useCart();
    const [orderNote, setOrderNote] = useState('');

    const subtotal = state.total;
    // const shippingFee = subtotal >= 100 ? 0 : 10; // Livraison gratuite à partir de 100€
    // const taxRate = 0.18; // 18% de taxes
    // const taxes = subtotal * taxRate;
    const finalTotal = subtotal ;

    const updateQuantity = (id: string, newQuantity: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity: newQuantity } });
    };

    const removeItem = (id: string) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { id } });
    };

    const handleCheckout = () => {
        // Logique de checkout à implémenter
        console.log('Proceeding to checkout...', { items: state.items, orderNote, total: finalTotal });
        alert('Fonctionnalité de paiement à implémenter');
    };

    if (state.items.length === 0) {
        return (
            <div className="min-h-screen bg-white">
                <TopBanner />
                <Header />
                <div className="max-w-4xl mx-auto px-6 py-16 text-center">
                    <h1 className="text-3xl font-bold text-black mb-8">CART</h1>
                    <div className="bg-gray-50 rounded-lg p-12">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2 4h12m-8 4a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z" />
                        </svg>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Votre panier est vide</h2>
                        <p className="text-gray-600 mb-6">Découvrez nos produits et ajoutez-les à votre panier</p>
                        <Link 
                            to="/boutique" 
                            className="inline-block bg-adawi-gold hover:bg-adawi-gold/90 text-white font-medium py-3 px-8 rounded-full transition-colors duration-300"
                        >
                            Continuer les achats
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <TopBanner />
            <Header />
            
            <div className="max-w-6xl mx-auto px-6 py-12">
                {/* Titre */}
                <h1 className="text-3xl font-bold text-center text-black mb-2 tracking-wider">CART</h1>
                
                {/* Message de livraison gratuite */}
                <p className="text-center text-gray-600 mb-12">
                    {/* {subtotal >= 100 ? (
                        "Vous êtes éligible pour une livraison gratuite."
                    ) : (
                        `Ajoutez ${(100 - subtotal).toFixed(0)} fcfa de produits pour une livraison gratuite.`
                    )} */}
                    Frais de livraison payé à la réception de la marchandise
                </p>

                {/* En-têtes du tableau */}
                <div className="hidden md:grid md:grid-cols-12 gap-4 pb-4 border-b border-gray-200 mb-8">
                    <div className="col-span-6">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">PRODUCT</h3>
                    </div>
                    <div className="col-span-3 text-center">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">QUANTITY</h3>
                    </div>
                    <div className="col-span-3 text-right">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">TOTAL</h3>
                    </div>
                </div>

                {/* Articles du panier */}
                <div className="space-y-8 mb-12">
                    {state.items.map((item) => {
                        const itemPrice = parseFloat(item.product.price.replace(/[^0-9.]/g, ''));
                        const itemTotal = itemPrice * item.quantity;

                        return (
                            <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-6 border-b border-gray-100">
                                {/* Produit */}
                                <div className="md:col-span-6 flex items-center space-x-4">
                                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        <img
                                            src={item.product.image}
                                            alt={item.product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                            {item.product.category}
                                        </p>
                                        <h3 className="text-base font-medium text-black mb-1 truncate">
                                            {item.product.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-2">
                                            {itemPrice.toFixed(2)} fcfa
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {item.selectedSize.toUpperCase()} / {item.selectedColor.toUpperCase()}
                                        </p>
                                    </div>
                                </div>

                                {/* Quantité */}
                                <div className="md:col-span-3 flex items-center justify-center space-x-3">
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        className="w-8 h-8 border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                                        disabled={item.quantity <= 1}
                                    >
                                        −
                                    </button>
                                    <span className="text-base font-medium text-black min-w-[2rem] text-center">
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="w-8 h-8 border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                                    >
                                        +
                                    </button>
                                </div>

                                {/* Total et Remove */}
                                <div className="md:col-span-3 text-right space-y-2">
                                    <p className="text-lg font-medium text-black">
                                        {itemTotal.toFixed(2)} fcfa
                                    </p>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="text-sm text-gray-500 hover:text-red-600 underline transition-colors"
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Section inférieure */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Note de commande */}
                    <div>
                        <h3 className="text-base font-medium text-black mb-4">Note de commande</h3>
                        <textarea
                            value={orderNote}
                            onChange={(e) => setOrderNote(e.target.value)}
                            placeholder="Comment pouvons-nous vous aider?"
                            className="w-full h-32 p-4 border border-black bg-white text-black rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-adawi-gold focus:border-transparent text-sm"
                        />
                    </div>

                    {/* Résumé et checkout */}
                    <div className="space-y-6">
                        {/* Calculs */}
                        <div className="space-y-3">
                            <div className="flex justify-between text-base">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-medium text-black">{subtotal.toFixed(2)} fcfa</span>
                            </div>
                            {/* <div className="flex justify-between text-base">
                                <span className="text-gray-600">Livraison:</span>
                                <span className="font-medium text-black">
                                    {shippingFee === 0 ? 'Free' : `${shippingFee.toFixed(2)} fcfa`}
                                    
                                </span>
                            </div> */}
                            <div className="flex justify-between text-base">
                                <span className="text-gray-600">Taxes:</span>
                                <span className="font-medium text-black">0 fcfa</span>
                            </div>
                            <div className="border-t pt-3">
                                <div className="flex justify-between text-lg font-bold">
                                    <span className="text-black">Total:</span>
                                    <span className="text-black">{finalTotal.toFixed(2)} fcfa</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-gray-500">
                            Taxes et <span className="underline">shipping</span> calculated at checkout
                        </p>

                        {/* Bouton checkout */}
                        <button
                            onClick={handleCheckout}
                            className="w-full bg-black text-white font-medium py-4 px-6 text-base rounded-full hover:bg-gray-800 transition-colors duration-200 tracking-wider"
                        >
                            COMMANDER
                        </button>

                        {/* Lien continuer les achats */}
                        <div className="text-center">
                            <Link 
                                to="/boutique" 
                                className="text-sm text-gray-600 hover:text-adawi-gold underline transition-colors"
                            >
                                Continuer les achats
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
