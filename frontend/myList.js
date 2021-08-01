import wixData from 'wix-data';
import wixLocation from 'wix-location';
import wixUsers from 'wix-users';

$w.onReady(function () {
    __ini__()
});

export function deleteDownload(event) {
    let $item = $w.at(event.context);
    let currentItem = $item("#dataset1").getCurrentItem();
    let itemID = `${currentItem._id}`;
    console.log(itemID)

    wixData.query("myList")
        .eq("movieId", itemID)
        .find()
        .then((downloadedItem) => {
            wixData.remove("myList", itemID).then(() => {
                $item("#image85").hide()
                $item("#box1").show("float", { direction: "right", duration: 300 })
                setTimeout(() => { $w("#dataset1").refresh() }, 400)
                __ini__()
            })
        })
}

export function __ini__() {
    $w("#dataset1").onReady(function () {
        if ($w("#dataset1").getCurrentItem().movieId.description === "undefined") {} else {
            $w("#repeater1").forEachItem(($item, itemData, index) => {
                console.log(itemData)
                $item("#text3").text = itemData.movieId.description.substr(0, 100)
            });
        }

        wixData.query("myList")
            .find()
            .then((results) => {
                var count = results.items.length
                if (count > 0) {
                    $w("#repeater1").expand()
                    $w("#text1").hide()
                } else {
                    $w("#text1").show()
                }
            })
    })

    $w("#dataset1").onAfterSave(() => {
        console.log("after save")
        $w('#dataset1').refresh();
    });
}

/*                                              








 ******  **                   **  
 ******  **   *****   ** **  *****
 **      **  *******   ***    **  
 **      **   *****  *** **    *** valentinfrlch

 You know, for movies.
*/
