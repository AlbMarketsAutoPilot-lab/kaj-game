plugins {
    id("com.android.application")
}

android {
    namespace = "com.kaj.game"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.kaj.game"
        minSdk = 24 // Android 7.0
        targetSdk = 36
        versionCode = 4 // 1: first review; 2: internal test of 1.0.0; 3: 1.0.1
        versionName = "1.0.2"
    }

    // R8 shrinks the Java part (owner, 2026-10-14, Play Console's advice); the game itself is the
    // web page in assets, which R8 does not touch. Upload the mapping file Play asks for.
    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation("androidx.activity:activity:1.10.1")
    implementation("androidx.webkit:webkit:1.17.1")
}
