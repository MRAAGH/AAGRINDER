/*
converts whatever the user typed for "favorite color" into a usable hex string.

if a hex string is found, it is used.

if one of the known color names is found, its hex string is used.

otherwise the returned color is "ffffff"
(the user probably typed something like "i dont know")
*/

const KNOWN_COLORS = {
  almond:"efdecd",amaranth:"e52b50",amber:"ffbf00",amethyst:"9966cc",ao:"008000",apricot:"fbceb1",aqua:"00ffff",aquamarine:"7fffd4",asparagus:"87a96b",auburn:"a52a2a",aureolin:"fdee00",aurometalsaurus:"6e7f80",awesome:"ff2052",azure:"007fff",bazaar:"98777b",beaver:"9f8170",beige:"f5f5dc",bisque:"ffe4c4",bistre:"3d2b1f",bittersweet:"fe6f5e",black:"000000",blond:"faf0be",blue:"0000ff",blush:"de5d83",bole:"79443b",bone:"e3dac9",boysenberry:"873260",brass:"b5a642",bronze:"cd7f32",brown:"a52a2a",bubbles:"e7feff",buff:"f0dc82",burgundy:"800020",burlywood:"deb887",byzantine:"bd33a4",byzantium:"702963",cadet:"536872",camel:"c19a6b",canary:"ffff99",capri:"00bfff",cardinal:"c41e3a",carmine:"ff0040",carnelian:"b31b1b",celadon:"ace1af",celeste:"b2ffff",cerise:"de3163",cerulean:"007ba7",chamoisee:"a0785a",champagne:"fad6a5",charcoal:"36454f",chartreuse:"7fff00",cherry:"de3163",chestnut:"cd5c5c",chocolate:"d2691e",cinereous:"98817b",cinnabar:"e34234",cinnamon:"d2691e",citrine:"e4d00a",cobalt:"0047ab",coffee:"6f4e37",copper:"b87333",coquelicot:"ff3800",coral:"ff7f50",cordovan:"893f45",corn:"fbec5d",cornflower:"9aceeb",cornsilk:"fff8dc",cream:"fffdd0",crimson:"dc143c",cyan:"00ffff",daffodil:"ffff31",dandelion:"f0e130",denim:"1560bd",desert:"c19a6b",drab:"967117",ecru:"c2b280",eggplant:"614051",eggshell:"f0ead6",emerald:"50c878",fallow:"c19a6b",famous:"ff00ff",fandango:"b53389",fawn:"e5aa70",feldgrau:"4d5d53",fern:"71bc78",firebrick:"b22222",flame:"e25822",flavescent:"f7e98e",flax:"eedc82",folly:"ff004f",fuchsia:"ff00ff",fulvous:"e48400",gainsboro:"dcdcdc",gamboge:"e49b0f",ginger:"b06500",glaucous:"6082b6",glitter:"e6e8fa",gold:"ffd700",goldenrod:"daa520",gray:"808080",green:"00ff00",grullo:"a99a86",harlequin:"3fff00",heliotrope:"df73ff",honeydew:"f0fff0",icterine:"fcf75e",inchworm:"b2ec5d",indigo:"4b0082",iris:"5a4fcf",isabelline:"f4f0ec",ivory:"fffff0",jade:"00a86b",jasmine:"f8de7e",jasper:"d73b3e",jonquil:"fada5e",khaki:"c3b091",lava:"cf1020",lavender:"e6e6fa",lemon:"fff700",lilac:"c8a2c8",lime:"bfff00",linen:"faf0e6",lion:"c19a6b",liver:"534b4f",lust:"e62020",magenta:"ff00ff",magnolia:"f8f4ff",mahogany:"c04000",maize:"fbec5d",malachite:"0bda51",manatee:"979aaa",mantis:"74c365",maroon:"800000",mauve:"e0b0ff",mauvelous:"ef98aa",melon:"fdbcb4",mint:"3eb489",moccasin:"faebd7",mulberry:"c54b8c",munsell:"f2f3f4",mustard:"ffdb58",myrtle:"21421e",ochre:"cc7722",olive:"808000",olivine:"9ab973",onyx:"0f0f0f",orange:"ffa500",orchid:"da70d6",patriarch:"800080",peach:"ffe5b4",pear:"d1e231",pearl:"eae0c8",peridot:"e6e200",periwinkle:"ccccff",phlox:"df00ff",pink:"ffc0cb",pistachio:"93c572",platinum:"e5e4e2",plum:"dda0dd",puce:"cc8899",pumpkin:"ff7518",purple:"800080",rackley:"5d8aa8",raspberry:"e30b5d",razzmatazz:"e3256b",red:"ff0000",rose:"ff007f",rosewood:"65000b",ruby:"e0115f",ruddy:"ff0028",rufous:"a81c07",russet:"80461b",rust:"b7410e",saffron:"f4c430",salmon:"ff8c69",sand:"c2b280",sandstorm:"ecd540",sapphire:"0f52ba",scarlet:"ff2400",seashell:"fff5ee",sepia:"704214",shadow:"8a795d",shamrock:"45cea2",sienna:"882d17",silver:"c0c0c0",sinopia:"cb410b",skobeloff:"007474",smalt:"003399",snow:"fffafa",stizza:"990000",stormcloud:"008080",straw:"e4d96f",sunglow:"ffcc33",sunset:"fad6a5",tan:"d2b48c",tangelo:"f94d00",tangerine:"f28500",taupe:"483c32",tawny:"cd5700",teal:"008080",thistle:"d8bfd8",timberwolf:"dbd7d2",tomato:"ff6347",toolbox:"746cc0",topaz:"ffc87c",tumbleweed:"deaa88",turquoise:"30d5c8",ube:"8878c3",ultramarine:"120a8f",umber:"635147",urobilin:"e1ad21",vanilla:"f3e5ab",verdigris:"43b3ae",vermilion:"e34234",veronica:"a020f0",violet:"ee82ee",viridian:"40826d",waterspout:"00ffff",wenge:"645452",wheat:"f5deb3",white:"ffffff",wine:"722f37",wisteria:"c9a0dc",xanadu:"738678",yellow:"ffff00",zaffre:"0014a8",
}

function parseColor(input){
  let lowInput = input.toLowerCase();
  let withoutBannedChars = lowInput.replace(/[^a-z0-9 ]/g, ' ');
  let words = withoutBannedChars.split(' ');
  for(let i = 0; i < words.length; i++){
    if(/^[0-9a-f]{6}$/.test(words[i])){
      return words[i]; // there was a hex string
    }
    let found = KNOWN_COLORS[words[i]];
    if(found){
      return found; // there was a color name
    }
  }
  return 'ffffff';
}
