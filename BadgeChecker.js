/*
I'm sharing below a take-home exercise that you can do with JS ideally. You can share a public repo when you are done. Everything (!) will be judged by our CTO when reviewing the exercise (code, repo structure, etc).
We want users to upload a badge: an avatar within a circle. Create a function taking a PNG as input and verifying that:

• Size = 512x512
• The only non-transparent pixels are within a circle
• The colors of the badge give a "happy" feeling

You can also create a parallel function that converts the given image (of any format) into the specified object.
*/

// Function to calculate the centroid of the shape
function calculateCentroid(edges) {
    let sumX = 0;
    let sumY = 0;

    // Calculate the sum of all x-coordinates and y-coordinates
    for (const edge of edges) {
        sumX += edge.x;
        sumY += edge.y;
    }

    // Divide the sum by the number of vertices to get the centroid coordinates
    const centroidX = sumX / edges.length;
    const centroidY = sumY / edges.length;
    return { x: Math.round(centroidX), y: Math.round(centroidY) }; //Math.round to get an integer number
}

// Function to determine if the provided edges form a circle
function isCircle(points) {
    const centroid = calculateCentroid(points);

    // Calculate the average distance from each point to the centroid
    let totalDistance = 0;
    for (const point of points) {
        const dx = point.x - centroid.x;
        const dy = point.y - centroid.y;
        totalDistance += Math.sqrt(dx * dx + dy * dy);
    }
    const averageDistance = totalDistance / points.length;
    const threshold = 2; // Set a threshold for equality
    
    // Check if all points are approximately at the same distance from the centroid
    for (const point of points) {
        const dx = point.x - centroid.x;
        const dy = point.y - centroid.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (Math.abs(distance - averageDistance) > threshold) {
            return false; // Not a circle
        }
    }
    return true; // All points are approximately equidistant from the centroid
}

// Define a function to check if a given color is within the specified range for any happy color
function isHappyColor(imageData, index) {
    const happyColors = [ //Possible happy colors 
        { name: 'yellow', range: { red: [200, 255], green: [200, 255], blue: [0, 100] } },
        { name: 'orange', range: { red: [200, 255], green: [100, 200], blue: [0, 50] } },
        { name: 'pink', range: { red: [200, 255], green: [0, 150], blue: [150, 255] } },
        { name: 'skyblue', range: { red: [0, 100], green: [150, 255], blue: [200, 255] } },
        { name: 'limegreen', range: { red: [0, 200], green: [200, 255], blue: [0, 100] } }
    ];
    const r = imageData.data[index]; // Red component of the pixel
    const g = imageData.data[index + 1]; // Green component of the pixel
    const b = imageData.data[index + 2]; // Blue component of the pixel

    //Check if the pixel's rgb corresponding to one of the selected HappyColors
    for (const happyColor of happyColors) {
        const { range } = happyColor;
        const { red, green, blue } = range;

        if (r >= red[0] && r <= red[1] &&
            g >= green[0] && g <= green[1] &&
            b >= blue[0] && b <= blue[1]) {
            return true; //It is a happy color
        }
    }
    return false; //It isn't a happy color 
}

//Find edges of the image's shape
function validateBadgeImage(imageData){
    let hasTransparency = false; //Variable to check if there is transparent pixels
    const height = imageData.height;
    const width = imageData.width;
    if(height !== 512 || width !== 512) // Size Check 
    {
        console.log("Wrong size");
        return false; //If it is false then stop the check 
    }
    let nonTransparentPixels = [{}]; // Array to collect all the pixels edges of the shape 
    let happyColorCount = 0; //Counter of happyColors pixels 
    for (let y = 0; y <= height; y++) { // Iterate on each pixels of the image 
        for (let x = 0; x <= width; x++) {
            
            const index = (y * width + x) * 4; // RGBA values
            const alpha = imageData.data[index + 3]; //transparency of the pixel (Alpha)
            const topAlpha = imageData.data[((y - 1) * width + x) * 4 + 3]; //Get the pixel above the current pixel
            const bottomAlpha = imageData.data[((y + 1) * width + x) * 4 + 3]; //Get the pixel under the current pixel
            const leftAlpha = imageData.data[(y * width + (x - 1)) * 4 + 3]; //Get the pixel at the left side of the current pixel
            const rightAlpha = imageData.data[(y * width + (x + 1)) * 4 + 3]; //Get the pixel at the right side of the current pixel
            if (alpha > 0) { // If the pixel is not transparent 
                if(!topAlpha && !bottomAlpha && !leftAlpha && !rightAlpha) //If the pixel is surrounded by transparent pixels  
                {
                    console.log("Non-transparent pixels surrounded by transparency")
                    return false; //Then we stop the check because a non transparent cannot be surrounded by transparent pixels
                }
                if((!topAlpha || !bottomAlpha || !leftAlpha || !rightAlpha)) // If a non transparent pixel is next to a transparent pixel then the current pixel is from the edges of the shape
                    nonTransparentPixels.push({ x: x, y: y }); //Keep coordinates of the pixel from the edges
                if(isHappyColor(imageData, index)) //If it returns true then the current pixel is a happy color
                    happyColorCount++; //Add to the sum of happyColors then 
            }
            else{ //If the pixel is transparent 
                hasTransparency = true; //So there is a presence of transparent pixel
                if ((topAlpha === 255 ? 1 : 0) + (bottomAlpha === 255 ? 1 : 0)  
                + (leftAlpha === 255 ? 1 : 0) + (rightAlpha === 255 ? 1 : 0) >= 2) { //If the current pixel is surrounded by more than 2 non transparent pixels then the circle is filled by transparent pixels
                    console.log("Transparent pixels surrounded by non-transparent pixels")
                    return false; // Stop the check because a transparent pixel is at the wrong place 
                }
            }
        }
    }
    if(!hasTransparency) //If after iterated on the image we didn't find at least one transparent pixel then it is false
    {
        console.log('No transparency')
        return false; //The shape cannot be a circle then 
    }
    //We clean the nonTransparentPixels array from possible undefined values 
    nonTransparentPixels = nonTransparentPixels.filter(value => value.x !== undefined);
    nonTransparentPixels = nonTransparentPixels.filter(value => value.y !== undefined);
    const result = isCircle(nonTransparentPixels); //Calculate from the edges if the shape found is a circle or not
    if(!result)
    {
        console.log(result + " non transparent pixels are not in a circle");
        return false;
    }
    const ColorsPercentage = (happyColorCount / (height * width)) * 100; //Calculate the ration of happy colors is our image
    if(Math.round(ColorsPercentage) < 50) //If the ratio is less than 50% than there is more pixels with unhappy colors 
    {
        console.log("Not enough happy colors");
        return false;
    }
    console.log("Image validated")
    return true; //Our image is validated
}


