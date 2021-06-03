import wixData from 'wix-data';
import wixLocation from 'wix-location';
import wixWindow from 'wix-window';

$w.onReady(function () {});

export function rate(event) {
	let $item = $w.at(event.context);
	let currentItem = $item("#dataset1").getCurrentItem();
	let itemID = `${currentItem._id}`;
	let item = {
		movie: currentItem
	}
	console.log(itemID)
	wixData.query("MemberPredictions")
		.eq("movie", itemID)
		.find()
		.then((like) => {
			wixData.insert("MemberPredictions", item)
			$item("#image87").show()
			$item("#box1").show()
		})
}

export function done(event) {
	wixData.query("MemberPredictions")
		.find()
		.then((results) => {
			console.log(results.items.length)
			wixWindow.openLightbox("Loading");
		})
}
