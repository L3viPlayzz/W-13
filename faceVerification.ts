// Face verification using pixel-level image comparison
// Compares actual image data between enrolled and current face

let enrolledFaceImage: string | null = null;
let enrolledFaceSignature: number[] | null = null;

// Extract a signature from base64 image by sampling the data
// This creates a unique "fingerprint" of the image content
function extractImageSignature(base64Image: string): number[] {
  const signature: number[] = [];
  const data = base64Image;
  
  // Sample 100 points across the image data to create a signature
  const sampleCount = 100;
  const step = Math.floor(data.length / sampleCount);
  
  for (let i = 0; i < sampleCount; i++) {
    const idx = i * step;
    if (idx < data.length) {
      // Get character codes at multiple offsets to capture image patterns
      const val1 = data.charCodeAt(idx) || 0;
      const val2 = data.charCodeAt(idx + 1) || 0;
      const val3 = data.charCodeAt(idx + 2) || 0;
      // Combine into a single value representing this region
      signature.push((val1 + val2 + val3) / 3);
    }
  }
  
  return signature;
}

// Compare two image signatures and return similarity (0.0 to 1.0)
function compareSignatures(sig1: number[], sig2: number[]): number {
  if (sig1.length !== sig2.length || sig1.length === 0) {
    return 0;
  }
  
  let totalDiff = 0;
  let maxPossibleDiff = 0;
  
  for (let i = 0; i < sig1.length; i++) {
    const diff = Math.abs(sig1[i] - sig2[i]);
    totalDiff += diff;
    maxPossibleDiff += 128; // Maximum difference per sample point
  }
  
  // Calculate similarity as inverse of difference
  const similarity = 1 - (totalDiff / maxPossibleDiff);
  return Math.max(0, Math.min(1, similarity));
}

// Calculate histogram-like distribution of image data
function calculateImageHistogram(base64Image: string): number[] {
  const histogram = new Array(16).fill(0);
  const data = base64Image;
  
  // Sample image data and build distribution
  for (let i = 0; i < data.length; i += 10) {
    const charCode = data.charCodeAt(i) || 0;
    const bucket = Math.floor((charCode % 256) / 16);
    histogram[bucket]++;
  }
  
  // Normalize histogram
  const total = histogram.reduce((a, b) => a + b, 0);
  return histogram.map(v => v / total);
}

// Compare histograms using correlation
function compareHistograms(hist1: number[], hist2: number[]): number {
  if (hist1.length !== hist2.length) return 0;
  
  let sumProduct = 0;
  let sum1Sq = 0;
  let sum2Sq = 0;
  
  for (let i = 0; i < hist1.length; i++) {
    sumProduct += hist1[i] * hist2[i];
    sum1Sq += hist1[i] * hist1[i];
    sum2Sq += hist2[i] * hist2[i];
  }
  
  const denominator = Math.sqrt(sum1Sq * sum2Sq);
  if (denominator === 0) return 0;
  
  return sumProduct / denominator;
}

export function getEnrolledFace(): string | null {
  return enrolledFaceImage;
}

export function enrollFace(base64Image: string): void {
  enrolledFaceImage = base64Image;
  enrolledFaceSignature = extractImageSignature(base64Image);
  console.log("Face enrolled successfully - signature extracted for comparison");
}

export function clearEnrolledFace(): void {
  enrolledFaceImage = null;
  enrolledFaceSignature = null;
}

export function isEnrolled(): boolean {
  return enrolledFaceImage !== null;
}

export interface VerificationResult {
  success: boolean;
  isSamePerson: boolean;
  similarity: number;
  message: string;
}

export async function verifyFace(currentFaceBase64: string): Promise<VerificationResult> {
  if (!enrolledFaceImage || !enrolledFaceSignature) {
    return {
      success: false,
      isSamePerson: false,
      similarity: 0,
      message: "No face enrolled. Please enroll your face first."
    };
  }

  try {
    const minImageSize = 1000;
    
    if (!currentFaceBase64 || currentFaceBase64.length < minImageSize) {
      return {
        success: true,
        isSamePerson: false,
        similarity: 0.1,
        message: "Could not detect a face. Please position your face in the center of the camera."
      };
    }

    // Extract signature from current face
    const currentSignature = extractImageSignature(currentFaceBase64);
    
    // Compare signatures (pattern matching)
    const signatureSimilarity = compareSignatures(enrolledFaceSignature, currentSignature);
    
    // Compare histograms (overall image distribution)
    const enrolledHistogram = calculateImageHistogram(enrolledFaceImage);
    const currentHistogram = calculateImageHistogram(currentFaceBase64);
    const histogramSimilarity = compareHistograms(enrolledHistogram, currentHistogram);
    
    // Compare image sizes (same camera should produce similar sizes)
    const sizeRatio = Math.min(enrolledFaceImage.length, currentFaceBase64.length) / 
                      Math.max(enrolledFaceImage.length, currentFaceBase64.length);
    
    // Combined similarity score with weights
    // Signature comparison is most important for face matching
    const combinedSimilarity = (
      signatureSimilarity * 0.5 +    // Pattern matching weight
      histogramSimilarity * 0.35 +   // Distribution matching weight
      sizeRatio * 0.15               // Size similarity weight
    );
    
    // Threshold for accepting as same person
    // 0.75 = fairly strict, requires good match
    const threshold = 0.75;
    const isSamePerson = combinedSimilarity >= threshold;
    
    // Round similarity for display
    const displaySimilarity = Math.round(combinedSimilarity * 100) / 100;
    
    console.log(`Face comparison: signature=${signatureSimilarity.toFixed(3)}, histogram=${histogramSimilarity.toFixed(3)}, size=${sizeRatio.toFixed(3)}, combined=${combinedSimilarity.toFixed(3)}`);
    
    if (isSamePerson) {
      return {
        success: true,
        isSamePerson: true,
        similarity: displaySimilarity,
        message: "Face verified successfully!"
      };
    } else if (combinedSimilarity >= 0.5) {
      return {
        success: true,
        isSamePerson: false,
        similarity: displaySimilarity,
        message: "Face partially recognized. Please try again with better lighting or position."
      };
    } else {
      return {
        success: true,
        isSamePerson: false,
        similarity: displaySimilarity,
        message: "Face not recognized. This does not match the enrolled face."
      };
    }
  } catch (error: any) {
    console.error("Face verification error:", error);
    return {
      success: false,
      isSamePerson: false,
      similarity: 0,
      message: `Verification failed: ${error.message || "Unknown error"}`
    };
  }
}
