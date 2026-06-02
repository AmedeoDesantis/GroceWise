from src.core.mongo import MongoDB
from src.factories.product_factory import ProductFactory
from src.repositories.product_repository import ProductRepository

if __name__ == "__main__":
    print("--- INIZIO TEST LOCALE GROCEWISE ---")
    
    db_locale = MongoDB()
    factory = ProductFactory()
    repository = ProductRepository(db_locale)
    
    barcode_test = "3017620422003" # Nutella
    prezzo_test = 4.50
    
    nuovo_alimento = factory.build_from_barcode(barcode_test, price=prezzo_test)
    
    if nuovo_alimento:
        print(f"Oggetto Alimento creato con successo da Pydantic!")
        print(f"   Nome: {nuovo_alimento.name} ({nuovo_alimento.brand})")
        print(f"   Calorie: {nuovo_alimento.nutrients.calories} kcal")
        
        # Il repository lo converte e lo inserisce nel DB
        id_inserito = repository.add_product(nuovo_alimento)
        print(f"💾 Prodotto salvato in MongoDB! ID Documento: {id_inserito}\n")
    
    print("Richiesta della lista completa degli alimenti dal database...")
    lista_prodotti = repository.get_all_products()
    
    print(f"Trovati {len(lista_prodotti)} prodotti nel database:")
    for indice, alimento in enumerate(lista_prodotti, 1):
        print(f"   {indice}. [{alimento.barcode}] {alimento.name} - €{alimento.price}")
        
    print("--- FINE TEST LOCALE GROCEWISE ---")