package main

import (
	"errors"
	"fmt"
	"github.com/itsubaki/q"
	"strconv"
)

type TimeTunnel struct {
	candidates   []q.Qubit
	isMeasured   bool
	isSuccessful bool
}

type QMessage struct {
	payload []q.Qubit
}

// MsgLength must be a dimension of integer logarithm
const MsgLength = 16

func main() {
	qs := q.New()
	// dbg: superposition measurements
	//qs.Rand = rand.Math
	//
	//timeArrowSim := qs.Zero()
	//qs.H(timeArrowSim)
	//
	//measured := qs.Measure(timeArrowSim)
	//fmt.Println("Measured", measured)
	// test OK

	// dbg: encoder
	var message = "Hello, world!"

	qMsg, err := quantumEncode(qs, message)
	if err != nil {
		fmt.Println("Error: ", err)
		return
	}

	fmt.Println("qMessage: ", qMsg)
}

func createTransport(qs *q.Q) TimeTunnel {
	// the number of attempts to get a time superposition with measured direction to the past
	// from an array of individual superpositions (not entangled)
	const attempts = 10

	capsuleArray := qs.ZeroWith(attempts)

	for i := 0; i < len(capsuleArray); i++ {
		// direction = CPast|0> + CFuture|1>
		qs.H(capsuleArray[i])
	}

	tunnel := TimeTunnel{
		candidates:   capsuleArray,
		isMeasured:   false,
		isSuccessful: false,
	}

	return tunnel
}

func load(qs *q.Q) {

}

func quantumEncode(qs *q.Q, msg string) (*QMessage, error) {
	// TODO: increase distances between elements in the Hilbert space
	//   - reduce the charset
	//   - randomize positions
	//   - replace normalization by a safe mapping

	// amplitude encoding:
	// - right-pad the string
	// - transform into int codes vector
	// - normalize the vector, it will be a discrete probability distribution
	// - create an amplitude vector:
	// msgVector = a1|0000> + a2|0001> + ...

	if len(msg) > MsgLength {
		return nil, errors.New("invalid message length")
	}

	fixedLengthStr := fmt.Sprintf("%-"+strconv.Itoa(MsgLength)+"s", msg)
	fmt.Printf("Fixed length message: '%s'\n", fixedLengthStr)

	runes := []rune(fixedLengthStr)
	fmt.Println("Runes: ", runes)

	normalizedAmplitudeVector := make([]float64, len(runes))

	for i, r := range runes {
		normalizedAmplitudeVector[i] = float64(r) / 255
	}
	fmt.Println("normalizedAmplitudeVector: ", normalizedAmplitudeVector)

	var ampVectorN = safeIntSqrt(MsgLength, MsgLength)
	if ampVectorN == nil {
		return nil, errors.New("invalid intSqrt argument")
	}

	ampVector := qs.ZeroWith(*ampVectorN)
	fmt.Println("ampVector (init)", ampVector)

	for _, qubit := range ampVector {
		// TODO - apply amp vector coords
	}

	qs.H(ampVector...)

	qm := QMessage{
		payload: ampVector,
	}

	return &qm, nil
}

func quantumDecode(qs *q.Q, qMessage QMessage) string {
	qs.Measure(qMessage.payload...)

	// TODO
	//  - measure
	//  - denormalize
	//  - transform

	return "implement me"
}

func safeIntSqrt(val int, max int) *int {
	for i := 0; i < max; i++ {
		if i*i == val {
			return &i
		}
	}
	return nil
}
