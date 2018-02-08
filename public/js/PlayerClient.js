/**************************************************
** GAME PLAYER CLASS
**************************************************/
let Player = function () {
	let player_reach = 10;
	let chunkX;
	let chunkY;
	let subchunkX;
	let subchunkY;

	function getChunkX() {
		return chunkX;
	}
	function getChunkY() {
		return chunkY;
	}
	function getSubchunkX() {
		return subchunkX;
	}
	function getSubchunkY() {
		return subchunkY;
	}

	function setPlayerChunk(_chunkX, _chunkY) {
		chunkX = _chunkX;
		chunkY = _chunkY;
	}

	function setPlayerPosition(_subchunkX, _subchunkY) {
		subchunkX = _subchunkX;
		subchunkY = _subchunkY;
	}

	let displayCoordinates = function () {
		$("#navbarx").text("x: " + (256 * chunkX + subchunkX));
		$("#navbary").text("y: " + (256 * chunkY + subchunkY));
	}

	return {
		setPlayerChunk: setPlayerChunk,
		setPlayerPosition: setPlayerPosition,
		displayCoordinates: displayCoordinates,
		getChunkX: getChunkX,
		getChunkY: getChunkY,
		getSubchunkX: getSubchunkX,
		getSubchunkY: getSubchunkY
	};
};