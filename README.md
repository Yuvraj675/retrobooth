# RetroBooth 📸

RetroBooth is a modern, web-based photobooth application with a nostalgic soul. It allows users to capture stylized photos in real-time, either solo or with a friend remotely via a peer-to-peer connection.

Designed with a premium "Retro" aesthetic, it features real-time canvas processing to ensure that every grain, blur, and frame you see in the preview is exactly what you get in your final digital keepsake.

## ✨ Features

- **Real-Time Retro Filters**: Live previews of Black & White, Sepia, Warm Retro, and High-Contrast Noir effects.
- **Remote "Double" Mode**: Connect with a friend via a unique Room ID. Their video feed appears side-by-side with yours for a shared photobooth strip experience.
- **WYSIWYG Capture**: Advanced canvas processing ensures the live preview match the final captured image 1:1, including film grain overlays and background blurs.
- **Smart Framing**:
  - **Solo Mode**: Vertical 3:4 portrait framing on mobile.
  - **Dual Mode**: Classic 2:1 landscape photobooth strip layout.
- **Interactive Experience**: Built-in countdown, camera flash animation, and click sounds.
- **Photo Strip Generation**: Automatically stitches 3 burst photos into a classic vertical strip (or 2x2 grid) ready for download.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite
- **Styling**: Tailwind CSS (Custom retro color palette & typography)
- **Real-Time Communication**: PeerJS (WebRTC wrapper for easy P2P video)
- **Image Processing**: HTML5 Canvas API (No backend image processing required)

## 🚀 Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Yuvraj675/retrobooth.git
    cd retrobooth
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    ```

4.  **Open in Browser**
    - Navigate to `http://localhost:5173` (or the network IP shown in the terminal for mobile testing).

## 📱 Mobile Testing
To test the camera on mobile devices:
1. Ensure your computer and phone are on the same Wi-Fi.
2. Run `npm run dev -- --host`.
3. Open the Network IP (e.g., `https://192.168.1.x:5173`) on your phone.
   - *Note: Browsers block camera access on non-localhost HTTP sites. You may need to enable "Insecure origins treated as secure" in `chrome://flags` on your mobile device for local testing, or use a tunneling service like ngrok.*

## 📸 Usage

### Solo Mode
1. Click **"New Session"** on the welcome screen.
2. Select **"Solo"**.
3. Choose your filter and frame style.
4. Strike a pose and wait for the countdown!

### Double Mode (Remote)
1. **Host**: Click **"New Session"** -> **"Create Room"**. Share the Room ID with a friend.
2. **Guest**: Click **"Join Room"** and enter the Room ID.
3. Once connected, your video feeds will sync side-by-side.
4. The Host controls the shutter!

## 📄 License
MIT License.
