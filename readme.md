TARKASTELUSSA HAVAITTUA:
- from china to finland -> crash (ei varmaan demossa niin tärkeä)
- käyttäjää luodessa ei kiinnitä huomiota onko maili maili (ei varmaan demossa niin tärkeä) vai sattuuko catparseris olemaan jotai tämmöstä toiminnallisuutta?
- virheellinen syöte (from testaajankatu to helsinki) tekee saman kuin kiina suomi, Artemil mieles apiresponse.status = "error"
- käyttäjien yhdistäminen? (findTripsInRange, carpool_api)
- google login -> automaattisesti tiedot sähköpostista?/nimi undefined tilalle? -> taikuutta user.js tiedostossa vai main.js tiedostossa vai passport.js tiedostossa?
- käyttäjän location auto syötteellä? https://www.w3schools.com/html/html5_geolocation.asp, Näköjään onkin jo toteutettu directions.js (getLocation) pitää vain linkittää se toimimaan hakukentissä?
- käytetäänkö säätietoja mihinkään? Trippiin voisi lisätä jotain kivaa digitraffic_api.js tiedostosta?
- kommentoidun kakadun poisto?
- turhien filujen poisto?
- kommentointi
- valmistenumero antaa GET https://saasab-jpef.c9users.io/ajoneuvodata_search?query=JHMCL75403 404 (Not Found). Valmistenumero napattu ajoneuvodata listalta. Lähettää getin jokaisen syötetyn merkin jälkeen.

Features:
- Location from IP and GPS
- 

APIS:
- Google Maps
- Digitraffic https://www.avoindata.fi/data/en/dataset/digitraffic-tieliikenne
- Päästötiedot
- 

IP-GPS (Location) From IP

Kuka tekee ja mitä!?"!?":
- Google Maps JANNE
    https://saasab-jpef.c9users.io/googlemaps_api
- DigiTraffic NIKO
    https://saasab-jpef.c9users.io/digitraffic_api
- Ajoneuvodata ARTEM
    https://saasab-jpef.c9users.io/ajoneuvodata_api
- IP2GPS NIKO
    https://saasab-jpef.c9users.io/iplocation_api (ottaa ip automaattisesti. ei toimi)
    https://saasab-jpef.c9users.io/iplocation_api?ip=86.50.40.96 (laitoin oman ip, toimii)
    -jokatapauksessa, tolla tyylillä saa helposti api väliservicen tehtyä, sit jos keksii jonku tavan löytää käyttäjän ip c9 env vielä


*Testasin tuota ip gps juttua, ni tuli tälläne ongelma:

Cloud9 is indeed using a two layer proxy to give access to applications running in workspaces. 
The first proxy is checking access rights and the second one is tunneling requests to the workspaces. 
The second proxy is hosted by our infrastructure provider OpenShift and that one overwrites the x-forwarded-for header set by the first one. 
Unfortunately we have no means to fix this at the moment. 
As mentioned in the comment try to avoid relying on the remote's IP.

http://stackoverflow.com/questions/19060477/get-users-real-ip-address-in-cloud9-ide
-Artem


7.4. TODO:
-Artem 
    Google Maps Interface (Input: lähtö, määränpää. Output: matka, aika, reitti jne.)
- Janne
    Login
- Niko
    Sää-api
    car pooling


