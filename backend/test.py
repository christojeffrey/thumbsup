import shamirs
partyASecret = 11
partyBSecret = 12
partyCSecret = 13
import time
MODULO = 257


partyASecrets = shamirs.shares(partyASecret, quantity=3, modulus=MODULO)

time.sleep(2)
partyBSecrets = shamirs.shares(partyBSecret, quantity=3, modulus=MODULO)
partyCSecrets = shamirs.shares(partyCSecret, quantity=3, modulus=MODULO)


# all party want to calculate the sum of their secrets, without revealing their secrets

# party A
partyA = partyASecrets[0]
partyB = partyBSecrets[0]
partyC = partyCSecrets[0] 
sum1 = partyA + partyB + partyC
print("Sum:", sum1)
manual = partyA.value + partyB.value + partyC.value
print("Manual:", manual % partyA.modulus )
# party B
partyA = partyASecrets[1]
partyB = partyBSecrets[1]
partyC = partyCSecrets[1]
sum2 = partyA + partyB + partyC
print("Sum:", sum2)

# party C
partyA = partyASecrets[2]
partyB = partyBSecrets[2]
partyC = partyCSecrets[2]
sum3 = partyA + partyB + partyC
print("Sum:", sum3)

# construct
result = shamirs.interpolate([sum1, sum2, sum3])
print("Result:", result)

# compare with the actual sum
assert result == partyASecret + partyBSecret + partyCSecret
print("Success")

