package main

import (
	"errors"
	"fmt"
	"github.com/itsubaki/q"
	"github.com/itsubaki/q/math/matrix"
	"github.com/itsubaki/q/math/rand"
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
const MsgLength = 32

func main() {
	qs := q.New()
	qs.Rand = rand.Math

	timeArrowSim := qs.Zero()
	qs.H(timeArrowSim)

	qs.Measure(timeArrowSim)

	fmt.Println("Measured", timeArrowSim)
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

	fixedLengthStr := fmt.Sprintf("%-32s", msg)

	runes := []rune(fixedLengthStr)

	normalizedAmplitudeVector := make([]float64, len(runes))

	for i, r := range runes {
		normalizedAmplitudeVector[i] = float64(r) / 255
	}

	ampVector := qs.ZeroLog2(MsgLength)

	// TODO: figure out how to apply...

	initializationMatrix := matrix.Matrix{}

	qs.Apply(initializationMatrix, ampVector...)

	qm := QMessage{
		payload: ampVector,
	}

	qs.H(ampVector...)

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
