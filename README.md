# Skin support tool for easier resprite for the game Boring Man
This tool is a prototype to make skin support easier for the game [Boring Man - OTSC](https://store.steampowered.com/app/346120/Boring_Man__Online_Tactical_Stickman_Combat/).

## How to use
- Load the sprite you want to resprite thanks to "Choose file". It's loaded when you see the content of the image.
- Search in sprite_info.txt to find the sprite width and height and the number of patterns (*its the number of images - 1*)
- Click "Modify next pattern". It will displays the current pattern to modify.  
  **N.B.**: *if the resizing is not what you want, you should change the resize factor now, because it resets most changes done.*
- "Lightest", "Normal", "Darkest", "Erase", "Clear all" are pretty much the only options for now. So, I'd say to leave resprite that needs other colors for a later version. It also means, it doesn't handle special skins (*tree, burning, rainbow*)
- "Enable image save" is if you want to resprite only some skins and will use the default skins left. It takes a bit of time to compute, so don't panic. Also, you need to use it to have the final image (*yep, I'm too lazy to implement that*)
- "Save as image" creates an image based on the modified patterns (*or not*). To save the image on your computer, you will have to right click on the created image and click "Save as...". Or you can copy it. *Or I motivate myself to be able to open it in a new tab, or download it.*
- "Replace original sprite" replaces the first sprite loaded. Its only use I've found is if you need to change any of the inputs and you don't want to lose your modifications.
- Note that all the default settings are set for the muleslapper sprite.

## Todo
- redo all that in React (*oof*)
- a video on how to use it
- an upgraded version