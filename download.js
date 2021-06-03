import wixData from 'wix-data';
import wixWindow from 'wix-window';

$w.onReady(function () {
    __ini__()
});

export function deleteDownload_click(event) {
    let $item = $w.at(event.context);
    let currentItem = $item("#dataset1").getCurrentItem();
    let itemID = `${currentItem._id}`;
    wixData.query("Downloads")
        .eq("newField", itemID)
        .find()
        .then((downloadedItem) => {
            wixData.remove("Downloads", itemID).then(() => {
                $item("#deleteDownload").hide()
                $item("#box1").show("float", { direction: "right", duration: 300 })
                setTimeout(() => { $w("#dataset1").refresh() }, 400)
                __ini__()
            })
        })
}

export function __ini__() {
    $w("#dataset1").onReady(function () {
        if ($w("#dataset1").getCurrentItem().newField.description === "undefined") {} else {
            $w("#repeater1").forEachItem(($item, itemData, index) => {
                console.log(itemData)
                $item("#text3").text = itemData.newField.description.substr(0, 100)
            });
        }

        wixData.query("Downloads")
            .find()
            .then((results) => {
                var count = results.items.length
                if (count > 0) {
                    $w("#repeater1").show()
                    $w("#text1").collapse()
                    $w("#group1").collapse()
                    $w("#button38").collapse()
                }
            })
    })
    $w("#dataset1").onAfterSave(() => {
        console.log("after save")
        $w('#dataset1').refresh();
    });
}
