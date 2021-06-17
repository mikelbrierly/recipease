beforeEach(() => {
  jasmine.addMatchers({
    toBePlaying: function () {
      return {
        compare(actual, expected) {
          let player = actual;

          return {
            pass: player.currentlyPlayingSong === expected && player.isPlaying,
          };
        },
      };
    },
  });
});
