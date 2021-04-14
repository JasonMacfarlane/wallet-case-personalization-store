var google = {
  maps : {
    OverlayView : function () { },
    Marker : function () { },
    InfoWindow : function () { },
    LatLng: function(lat, lng){
      return [ lat, lng ];
    },
    Map: function(obj) { },
    MapTypeId: { ROADMAP: true },
    places: {
      Autocomplete: function() {
        return {
          addListener: function() { },
        }
      },
      AutocompleteService: function() { },
      PlacesService: function(obj) {
        return {
          PlacesServiceStatus: {
            OK: true
          },
          textSearch: function(query){
            return [];
          },
          nearbySearch: function(query){
            return [];
          }
        };
      }
    }
  }
};
