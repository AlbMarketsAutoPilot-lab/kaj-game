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
        versionCode = 1
        versionName = "1.0.0"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation("androidx.webkit:webkit:1.17.1")
}
