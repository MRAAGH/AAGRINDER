/*

PlayerData is the class holding everything about the players that needs to get saved to disk
and loaded from disk.

It also acts as an abstraction over players,
so that new players are handled gracefully (so long as they are registered)
Calling getPlayerByName always works for registered usernames.
If the player does not exist in this world, they are added at coordinates null, null
*/
