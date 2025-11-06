"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

// --- Type Definitions ---

type Screen = "landing" | "input" | "loading" | "recommendation" | "match" | "final"
type MovieData = [string, string, string, string]

// --- Style Constants (Standardization) ---

const inputStyles =
  "w-full bg-lettuce-light/20 border-0 border-b-2 border-lettuce-dark rounded-none px-4 py-3 text-lettuce-darkest placeholder:text-lettuce-darkest/60 focus:border-b-lettuce-dark focus:ring-0 focus:outline-none"

const primaryButtonStyles =
  "bg-lettuce-light text-lettuce-dark border-2 border-lettuce-dark hover:bg-lettuce-dark hover:text-lettuce-light hover:border-lettuce-light transition-colors duration-500"

export default function LettuceWatchApp() {
  // --- App State ---
  const [currentScreen, setCurrentScreen] = useState<Screen>("landing")
  const [userUsername, setUserUsername] = useState("")
  const [theirUsername, setTheirUsername] = useState("")
  const [showOverlay, setShowOverlay] = useState(false) // This state now controls the flip
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0)
  const [savedMovies, setSavedMovies] = useState<string[]>([])
  const [movies, setMovies] = useState<MovieData[]>([])

  // --- Derived State (Calculated from state) ---
  const currentMovie =
    movies.length > 0 && currentMovieIndex < movies.length
      ? movies[currentMovieIndex]
      : null
  const isLastMovie = currentMovieIndex >= movies.length - 1
  const hasMovies = movies.length > 0
  const isFormValid = userUsername.trim() && theirUsername.trim()

  // --- Animation Definitions ---
  const fadeVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  }
  const transition = { duration: 0.5, ease: "easeInOut" }
  const delayedFadeVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { delay: 1.2, duration: 0.7 } },
    exit: { opacity: 0 },
  }
  const bun1JumpVariants = {
    initial: { opacity: 0, x: -200 }, // Start off-screen left
    animate: {
      opacity: 1,
      x: [-1000, 0],
      y: [1000, -100, 0], // Keyframes for the "jump" arc
      transition: { delay: 0.15, duration: 0.6, ease: "easeInOut" },
    },
    exit: { opacity: 0, x: -200 },
  }

  const bun2JumpVariants = {
    initial: { opacity: 0, x: 200 }, // Start off-screen right
    animate: {
      opacity: 1,
      x: [1000, 0],
      y: [1000, -100, 0], // Keyframes for the "jump" arc
      transition: { delay: 0.15, duration: 0.6, ease: "easeInOut" },
    },
    exit: { opacity: 0, x: 200 },
  }

  // --- Movie Data Helpers ---
  const getMovieTitle = (movie: MovieData) => movie[0]
  const getMovieDescription = (movie: MovieData) => movie[1]
  const getMoviePoster = (movie: MovieData) => movie[2]
  const getMovieUrl = (movie: MovieData) => movie[3]

  // --- Event Handlers ---

  const handleGoClick = () => {
    setCurrentScreen("input")
  }

  const handleContinueClick = async () => {
    if (!isFormValid) return

    setCurrentScreen("loading")
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/compare?username1=${encodeURIComponent(
          userUsername
        )}&username2=${encodeURIComponent(theirUsername)}`
      )

      if (!response.ok) {
        throw new Error("Failed to fetch movie data from the backend.")
      }

      const data: MovieData[] = await response.json()
      setMovies(data)
    } catch (error) {
      console.error("Error fetching movies:", error)
      setMovies([])
    } finally {
      setCurrentScreen("recommendation")
    }
  }

  const handleDecision = (save: boolean) => {
    setShowOverlay(false) // Ensure card is flipped back on decision

    if (save && currentMovie) {
      // Add to saved list
      setSavedMovies((prevSaved) => [...prevSaved, getMovieTitle(currentMovie)])
      // Go to match screen
      setCurrentScreen("match")
    } else {
      // This is the skip logic
      if (isLastMovie) {
        setCurrentScreen("final")
      } else {
        setCurrentMovieIndex((prevIndex) => prevIndex + 1)
      }
    }
  }

  const handleKeepSearching = () => {
    if (isLastMovie) {
      setCurrentScreen("final")
    } else {
      setCurrentMovieIndex((prevIndex) => prevIndex + 1)
      setCurrentScreen("recommendation") // Go back to recommendations
    }
  }

  const handleReturnToHome = () => {
    setCurrentScreen("landing")
    setCurrentMovieIndex(0)
    setSavedMovies([])
    setUserUsername("")
    setTheirUsername("")
    setShowOverlay(false)
  }

  const toggleOverlay = () => {
    setShowOverlay((prev) => !prev)
  }

  const handleTitleClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  // --- Lifecycle Hooks ---

  useEffect(() => {
    if (
      currentScreen === "recommendation" ||
      currentScreen === "match" // Also reset overlay when match screen appears
    ) {
      setShowOverlay(false) // Ensure card is reset
    }
    if (currentScreen === "recommendation") {
      // Only reset movies when returning to the main recommendation screen
      // not when moving from recommendation to match
      if (savedMovies.length === 0) {
        setCurrentMovieIndex(0)
      }
    }
  }, [currentScreen])

  // --- Render ---

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
        currentScreen === "final"
          ? "bg-lettuce-dark"
          : currentScreen === "match"
          ? "bg-lettuce-darkest"
          : "bg-cream"
      }`}
    >
      <div className="w-full max-w-sm mx-auto">
        <AnimatePresence mode="wait">
          {/* --- Screen: Landing --- */}
          {currentScreen === "landing" && (
            <motion.div
              key="landing"
              variants={fadeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transition}
              className="text-center space-y-8"
            >
              <h1 className="text-title text-lettuce-darkest mb-8">
                lettuce watch!
              </h1>

              <div className="flex justify-center mb-8">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/design-mode-images/Group%204-NC7p7CpOQ8zLR6AONMoIBni6rBgRF9.svg"
                  alt="Lettuce Watch mascots"
                  className="w-72 h-72 object-contain"
                />
              </div>

              <Button
                onClick={handleGoClick}
                className={`${primaryButtonStyles} px-5 py-2 rounded-full text-lg`}
              >
                go!
              </Button>
            </motion.div>
          )}

          {/* --- Screen: Input --- */}
          {currentScreen === "input" && (
            <motion.div
              key="input"
              variants={fadeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transition}
              className="text-center space-y-6"
            >
              <div className="mb-8">
                <h2 className="text-title text-lettuce-darkest">
                  {"let's connect with letterboxd!"}
                </h2>
              </div>

              <div className="space-y-6">
                <div className="text-left">
                  <label className="block text-heading text-lettuce-darkest mb-2">
                    your username
                  </label>
                  <input
                    type="text"
                    value={userUsername}
                    onChange={(e) => setUserUsername(e.target.value)}
                    className={inputStyles}
                    placeholder=""
                  />
                </div>

                <div className="text-left">
                  <label className="block text-heading text-lettuce-darkest mb-2">
                    their username
                  </label>
                  <input
                    type_text="text"
                    value={theirUsername}
                    onChange={(e) => setTheirUsername(e.target.value)}
                    className={inputStyles}
                    placeholder=""
                  />
                </div>
              </div>

              <Button
                onClick={handleContinueClick}
                disabled={!isFormValid}
                className={`${primaryButtonStyles} px-8 py-2 rounded-full text-lg disabled:opacity-60`}
              >
                continue
              </Button>
            </motion.div>
          )}

          {/* --- Screen: Loading --- */}
          {currentScreen === "loading" && (
            <motion.div
              key="loading"
              variants={fadeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transition}
              className="text-center space-y-8"
            >
              <h2 className="text-title text-lettuce-darkest mb-8">
                {"let's compare!"}
              </h2>

              <div className="flex justify-center items-center space-x-2">
                <motion.img
                  src="/bun1.svg"
                  alt="Loading bunny 1"
                  className="w-24 h-24 object-contain"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                />
                <img
                  src="/plus.svg"
                  alt="Plus"
                  className="w-4 h-4 object-contain"
                />
                <motion.img
                  src="/bun2.svg"
                  alt="Loading bunny 2"
                  className="w-24 h-24 object-contain"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* --- Screen: Recommendation --- */}
          {currentScreen === "recommendation" && (
            <motion.div
              key="recommendation"
              variants={fadeVariants}
              initial="initial"
              animate="animate"
              transition={transition}
              className="text-center space-y-6"
            >
              <div className="flex justify-center mb-4">
                <img
                  src="/bun1.svg"
                  alt="Bunny 1"
                  className="w-20 h-20 object-contain"
                />
                <img
                  src="/bun2.svg"
                  alt="Bunny 2"
                  className="w-20 h-20 object-contain"
                />
              </div>

              {hasMovies && currentMovie ? (
                <>
                  <h3
                    className="text-heading text-lettuce-darkest mb-6 cursor-pointer hover:underline transition-all duration-500"
                    onClick={() =>
                      handleTitleClick(getMovieUrl(currentMovie))
                    }
                  >
                    {getMovieTitle(currentMovie)}
                  </h3>

                  <div className="flex justify-center mb-8 relative [perspective:1000px]">
                    <motion.div
                      className="relative w-48 h-72 cursor-pointer [transform-style:preserve-3d]"
                      onClick={toggleOverlay}
                      animate={{ rotateY: showOverlay ? 180 : 0 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    >
                      {/* Card Front: The Poster */}
                      <div className="absolute inset-0 [backface-visibility:hidden]">
                        <img
                          src={
                            getMoviePoster(currentMovie) || "/placeholder.svg"
                          }
                          alt={`${getMovieTitle(
                            currentMovie
                          )} movie poster`}
                          className="w-full h-full object-cover rounded-lg border-2 border-b-2 border-lettuce-dark"
                          onError={(e) => {
                            // Fallback for broken images
                            const target = e.target as HTMLImageElement
                            target.src = `/placeholder.svg?height=300&width=200&text=${encodeURIComponent(
                              getMovieTitle(currentMovie) + " Poster"
                            )}`
                          }}
                        />
                      </div>

                      {/* Card Back: The Synopsis (with poster bg) */}
                      <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-lg overflow-hidden">
                        {/* Layer 1: Poster Image */}
                        <img
                          src={
                            getMoviePoster(currentMovie) || "/placeholder.svg"
                          }
                          alt="" // Alt text is decorative here
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback for broken images
                            const target = e.target as HTMLImageElement
                            target.src = `/placeholder.svg?height=300&width=200&text=${encodeURIComponent(
                              getMovieTitle(currentMovie) + " Poster"
                            )}`
                          }}
                        />
                        {/* Layer 2: Dark Overlay */}
                        <div className="absolute inset-0 bg-lettuce-dark/90" />

                        {/* Layer 3: Text Content */}
                        <div className="absolute inset-0 h-full w-full overflow-y-auto p-4 flex items-start justify-center">
                          <div className="text-cream text-sm leading-relaxed text-left max-w-full pt-2">
                            <p>{getMovieDescription(currentMovie)}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  <div className="flex justify-center space-x-24">
                    <div
                      className="relative w-10 h-10 cursor-pointer group"
                      onClick={() => handleDecision(false)}
                    >
                      <img
                        src="/x.svg"
                        alt="Skip"
                        className="absolute w-full h-full object-contain transition-opacity duration-200 ease-in-out group-hover:opacity-0"
                      />
                      <img
                        src="/xfilled.svg"
                        alt="Skip"
                        className="absolute w-full h-full object-contain opacity-0 transition-opacity duration-200 ease-in-out group-hover:opacity-100"
                      />
                    </div>

                    <div
                      className="relative w-10 h-10 cursor-pointer group"
                      onClick={() => handleDecision(true)}
                    >
                      <img
                        src="/like.svg"
                        alt="Save"
                        className="absolute w-full h-full object-contain transition-opacity duration-200 ease-in-out group-hover:opacity-0"
                      />
                      <img
                        src="/likefilled.svg"
                        alt="Save"
                        className="absolute w-full h-full object-contain opacity-0 transition-opacity duration-200 ease-in-out group-hover:opacity-100"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-4 py-20">
                  <h3 className="text-lg text-lettuce-darkest">
                    No common movies!
                  </h3>
                  <p className="text-sm text-lettuce-darkest">
                    Try comparing with another friend.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* --- Screen: Match (NEW) --- */}
          {currentScreen === "match" && (
            <motion.div
              key="match"
              //variants={fadeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transition}
              className="text-center space-y-6"
            >
              <div className="flex justify-center mb-4">
                <motion.img
                  src="/bun1cream.svg"
                  alt="Bunny 1"
                  className="w-20 h-20 object-contain"
                  variants={bun1JumpVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                />
                <motion.img
                  src="/bun2cream.svg"
                  alt="Bunny 2"
                  className="w-20 h-20 object-contain"
                  variants={bun2JumpVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                />
              </div>
              <h3 className="text-heading text-cream mb-6 transition-all duration-500">
                {"it's a match!"}
              </h3>

              {hasMovies && currentMovie ? (
                <>
                  <motion.div
                    variants={delayedFadeVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-6" // Use space-y here
                  >
                    {/* Poster flip logic (same as recommendation) */}
                    <div className="flex justify-center mb-8 relative [perspective:1000px]">
                      <motion.div
                        className="relative w-48 h-72 cursor-pointer [transform-style:preserve-3d]"
                        onClick={toggleOverlay}
                        animate={{ rotateY: showOverlay ? 180 : 0 }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                      >
                        {/* Card Front: The Poster */}
                        <div className="absolute inset-0 [backface-visibility:hidden]">
                          <img
                            src={
                              getMoviePoster(currentMovie) || "/placeholder.svg"
                            }
                            alt={`${getMovieTitle(
                              currentMovie
                            )} movie poster`}
                            className="w-full h-full object-cover rounded-lg border-2 border-b-2 border-lettuce-dark" // Kept border for consistency
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = `/placeholder.svg?height=300&width=200&text=${encodeURIComponent(
                                getMovieTitle(currentMovie) + " Poster"
                              )}`
                            }}
                          />
                        </div>

                        {/* Card Back: The Synopsis (with poster bg) */}
                        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-lg overflow-hidden">
                          <img
                            src={
                              getMoviePoster(currentMovie) || "/placeholder.svg"
                            }
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = `/placeholder.svg?height=300&width=200&text=${encodeURIComponent(
                                getMovieTitle(currentMovie) + " Poster"
                              )}`
                            }}
                          />
                          <div className="absolute inset-0 bg-lettuce-dark/90" />
                          <div className="absolute inset-0 h-full w-full overflow-y-auto p-4 flex items-start justify-center">
                            <div className="text-cream text-sm leading-relaxed text-left max-w-full pt-8">
                              <p>{getMovieDescription(currentMovie)}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* "keep searching?" button added */}
                    <div className="flex justify-center space-x-24 pt-4">
                      <Button
                        onClick={handleKeepSearching}
                        className={`bg-transparent text-cream hover:bg-transparent hover:text-lettuce-mid transition-colors duration-200 px-6 py-2 rounded-full text-lg`}
                      >
                        keep searching?
                      </Button>
                    </div>
                  </motion.div>
                </>
              ) : (
                // Fallback
                <div className="text-center space-y-4 py-20">
                  <h3 className="text-lg text-cream">No common movies!</h3>
                  <p className="text-sm text-cream">
                    Try comparing with another friend.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* --- Screen: Final --- */}
          {currentScreen === "final" && (
            <motion.div
              key="final"
              variants={fadeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transition}
              className="text-center space-y-8 pt-24 mb-24"
            >
              <h1 className="text-title text-cream mb-8 decoration-2 underline-offset-4">
                {"here are your matches!"}
              </h1>

              <div className="flex justify-center space-x-2 mb-6">
                <img
                  src="/bun1cream.svg"
                  alt="Bunny 1"
                  className="w-18 h-18 object-contain"
                />
                <img
                  src="/bun2cream.svg"
                  alt="Bunny 2"
                  className="w-16 h-18 object-contain"
                />
              </div>
              <div className="border-2 border-cream rounded-lg p-6 h-96 overflow-y-auto mb-6 pt-6">
                {savedMovies.length > 0 ? (
                  <div className="space-y-1">
                    {savedMovies.map((movieTitle, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <p className="text-left text-lg text-cream py-1">
                          {movieTitle}
                        </p>
                        <img
                          src="/dashedline.svg"
                          alt=""
                          className="w-full h-auto opacity-50"
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-lg text-cream py-8 text-center">
                    No movies saved this session
                  </div>
                )}
              </div>

              <Button
                onClick={handleReturnToHome}
                className={`bg-transparent text-cream hover:bg-lettuce-dark hover:text-lettuce-light hover:border-lettuce-light transition-colors duration-500 px-12 py-3 rounded-full text-lg`}
              >
                return to home
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}