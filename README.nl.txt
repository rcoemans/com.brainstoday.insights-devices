Maak voorgedefinieerde en aangepaste virtuele meetapparaten die hun gegevens via MQTT ontvangen.

Functies:
- Enkele MQTT broker verbinding op app-niveau met automatische herverbinding
- Vloerverwarming Monitor: volgt aanvoer-/retourtemperaturen en berekent automatisch Delta T
- Grondniveau Monitor: bewaakt grond- of waterniveaus
- NRG-Watch Itho CVE: integratie voor Itho Daalderop CVE ventilatiesystemen via MQTT
- Awtrix 3: integreert Awtrix 3 LED matrix display voor monitoring en notificaties
- Aangepaste MQTT Sensor: flexibel apparaat met ondersteuning voor numerieke, JSON object en JSON array payloads met aangepaste mappings en berekende velden
- Generieke MQTT client: trigger op elk MQTT onderwerp en publiceer berichten met aangepaste QoS en retain instellingen
- Insights logging voor alle metingen
- Ondersteuning voor TLS/SSL, authenticatie, aangepaste client IDs en LWT

Ondersteunde Apparaten:
- Vloerverwarming Monitor
- Grondniveau Monitor
- NRG-Watch Itho CVE
- Awtrix 3
- Aangepaste MQTT Sensor

Installatie:
1. Installeer de app op je Homey
2. Configureer MQTT broker instellingen in app configuratie (IP/DNS, poort, optioneel TLS en authenticatie)
3. Voeg apparaten toe via de standaard Homey koppeling flow
4. Configureer MQTT onderwerpen en apparaat-specifieke instellingen voor elk apparaat
5. Apparaten zullen automatisch abonneren op onderwerpen en gegevens ontvangen

MQTT Broker Configuratie:
- Broker IP-adres of DNS naam
- Poortnummer (standaard: 1883 voor standaard, 8883 voor TLS)
- Optioneel TLS/SSL met certificaatvalidatie controle
- Optioneel gebruikersnaam/wachtwoord authenticatie
- Optioneel aangepaste client ID
- Optioneel LWT (Last Will and Testament) configuratie
- Configureerbaar keepalive interval (standaard: 60 seconden)

Elk apparaattype heeft specifieke MQTT onderwerp vereisten en payload formaten. Configureer onderwerpen in apparaatinstellingen na koppeling.

Logging & Diagnostiek:
- Bekijk applicatielogs in app instellingen onder "Device Logs"
- Filter logs op bron: Alle, App, MQTT, Itho CVE
- Kopieer logs naar klembord voor probleemoplossing
- Wis logs wanneer niet meer nodig

Voor gedetailleerde documentatie bezoek:
- README.md in de app repository
- Awtrix 3: https://blueforcer.github.io/awtrix3/#/
- NRG.Watch: https://www.nrgwatch.nl/
