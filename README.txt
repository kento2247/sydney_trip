Sydney 2026 travel website

Open index.html in a browser or publish this folder as-is on GitHub Pages.
The site is intentionally lightweight: no embedded map library; route links open Google Maps / Transport for NSW / Uber.
Weather uses Open-Meteo when online. Photos are remote Wikimedia thumbnails and most index images lazy-load.
The calendar file is sydney-2026-itinerary.ics and uses Australia/Sydney (AEST/AEDT) timezone definitions.

v3 image fix:
- Replaced invalid thumb.wikimedia.org image references with upload.wikimedia.org.
- Photos are still remote Wikimedia images, so an internet connection is required to display them.


v5 all-stop maps:
- Every day page now contains an embedded OpenStreetMap-based map with numbered pins for all distinct travel stops.
- Pin numbers match the place list under each map. Click a pin or place row to open Google Maps.
- Same-building conference activities on 9/28 are consolidated into the ICC Sydney pin.
- Tokyo arrival airport on 9/30 was not specified in the source itinerary, so no guessed airport pin was added.

v6 day swap (9/27 <-> 9/29):
- Swapped the full itineraries of 9/27 and 9/29: 9/27 is now CBD walk + Manly + Dinner Cruise, 9/29 is now bills / Bondi / Taronga / Royal Botanic Garden / Opera House / dinner.
- Day pages, hero images, notes, ferry alerts, pin maps, index day cards and the .ics were all updated.
- ICS event UIDs were intentionally left unchanged so an already-imported calendar updates the existing entries in place (SEQUENCE bumped to 1). UID date prefixes therefore no longer match the event date.

v7 timing fixes:
- 9/27: reordered for Sunday opening hours. St Mary's Cathedral moved to 12:30 (10:30 Sunday Mass), QVB to 11:00 (Sunday opening), Manly 13:45-16:00 with a 16:00-16:15 departure, Eastern Pontoon 17:15-17:30, boarding 17:45, cruise 18:00-20:00. Pin order follows the new sequence.
- 9/29: The Rover shifted to 16:15-18:00 (20 min from Opera House; Mon-Fri 16:00-24:00, walk-in only, happy hour to 18:00). Kingsleys Tuesday hours 17:30-21:00 noted.
- 9/30: stay departure moved to 05:30, airport arrival 06:00.
- ICS: a separate 18:00-20:00 Dinner Cruise event was added for 9/27 (UID 20260927-cruise); the 17:15 event is now the arrival/meet-up. Modified events got a bumped SEQUENCE.

v8 menu + split-the-bill form:
- The top-right INDEX link was replaced by a hamburger button that opens a right-side drawer (INDEX, all six days, the split-the-bill Google Form, the .ics download). Closes on backdrop click, the X button, Escape, or picking a link.
- Google Form for splitting expenses is linked from the drawer on every page and from QUICK LINKS on index.html.

v9 bookings:
- 9/29: Chophouse Sydney (25 Bligh St) booked 20:30-22:30, added as the last item. Kingsleys was trimmed to 19:00-20:00 so the two do not overlap.
- 9/28: breakfast at Kurtosh - Darling Square (Shop 1, 16 Nicolle Walk, Haymarket) added at 08:30-09:30 as the day's first item; agenda numbers and map pins shifted accordingly.
- 9/28: the 14:30-16:30 slot is now "Show and tell" listening for paper 3571 (Coco-VC, Ryo Kato) and 3577 (audio comic from manga, Sota Koshino), replacing the generic venue-walk entry.

v10 afternoon rework:
- 9/28: Royal Botanic Garden 14:30-16:00 inserted before the Show and tell listening slot, which is now 16:00-16:30 (papers 3571 / 3577). Garden pin added to the day map.
- 9/29: Royal Botanic Garden dropped. Taronga Zoo moved to the start (09:30-11:45, ferry 08:45), Bondi Beach moved to midday (12:45-14:30). Hero and index card images switched to a Bondi Beach photo (DXR, CC BY-SA 4.0) since the garden photo no longer matched the day.
- ICS: the garden event was re-pointed to 9/28 (UID 20260928-garden); a 20260929-ferry event was added for the Taronga crossing.

v11 evening tweak (9/29):
- The Rover moved to 17:00-18:00.
- Chophouse Sydney removed from 9/29 (page, map pin and the 20260929-chophouse ICS event).
- Kingsleys extended back to 19:00-21:00 (Tuesday close).
- Note: removing the Chophouse event from the .ics does not delete it from a calendar that already imported it; delete that entry by hand if so.
